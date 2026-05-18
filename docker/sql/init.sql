-- ============================================================
-- killer-bee — Initialisation de la base de données
-- ============================================================

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'killer_bee')
BEGIN
    CREATE DATABASE killer_bee;
END
GO

USE killer_bee;
GO

-- ============================================================
-- TABLES
-- ============================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UTILISATEUR')
BEGIN
    CREATE TABLE UTILISATEUR (
        id           INT           IDENTITY(1,1) PRIMARY KEY,
        nom_complet  NVARCHAR(100) NOT NULL,
        email        NVARCHAR(255) NOT NULL,
        mot_de_passe NVARCHAR(64)  NOT NULL,
        cree_le      DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT UQ_UTILISATEUR_EMAIL UNIQUE (email)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SESSION')
BEGIN
    CREATE TABLE SESSION (
        id             INT           IDENTITY(1,1) PRIMARY KEY,
        token          NVARCHAR(512) NOT NULL,
        utilisateur_id INT           NOT NULL,
        cree_le        DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_SESSION_UTILISATEUR FOREIGN KEY (utilisateur_id)
            REFERENCES UTILISATEUR(id) ON DELETE CASCADE
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'INGREDIENT')
BEGIN
    CREATE TABLE INGREDIENT (
        id          INT           IDENTITY(1,1) PRIMARY KEY,
        nom         NVARCHAR(150) NOT NULL,
        description NVARCHAR(500)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'FREEZE_BEE')
BEGIN
    CREATE TABLE FREEZE_BEE (
        id               INT           IDENTITY(1,1) PRIMARY KEY,
        nom              NVARCHAR(150) NOT NULL,
        description      NVARCHAR(500),
        prix_unitaire_HT FLOAT         NOT NULL,
        gamme            NVARCHAR(100),
        grammage         INT           NOT NULL
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'FREEZE_BEE_INGREDIENT')
BEGIN
    CREATE TABLE FREEZE_BEE_INGREDIENT (
        freeze_bee_id INT NOT NULL,
        ingredient_id INT NOT NULL,
        CONSTRAINT PK_FBI PRIMARY KEY (freeze_bee_id, ingredient_id),
        CONSTRAINT FK_FBI_FREEZE_BEE FOREIGN KEY (freeze_bee_id)
            REFERENCES FREEZE_BEE(id) ON DELETE CASCADE,
        CONSTRAINT FK_FBI_INGREDIENT FOREIGN KEY (ingredient_id)
            REFERENCES INGREDIENT(id) ON DELETE CASCADE
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PROCESSUS')
BEGIN
    CREATE TABLE PROCESSUS (
        id                    INT           IDENTITY(1,1) PRIMARY KEY,
        nom                   NVARCHAR(200) NOT NULL,
        description           NVARCHAR(500),
        freeze_bee_id         INT           NOT NULL,
        etapes                NVARCHAR(MAX),
        validations_tests     NVARCHAR(MAX),
        descriptions_controle NVARCHAR(MAX),
        CONSTRAINT FK_PROCESSUS_FREEZE_BEE FOREIGN KEY (freeze_bee_id)
            REFERENCES FREEZE_BEE(id)
    );
END
GO

-- ============================================================
-- PROCEDURES STOCKEES — UTILISATEUR / SESSION
-- ============================================================

CREATE OR ALTER PROCEDURE sp_GetUserByEmail
    @email NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id, nom_complet, email, mot_de_passe, cree_le
    FROM UTILISATEUR
    WHERE email = @email;
END
GO

CREATE OR ALTER PROCEDURE sp_GetUserById
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id, nom_complet, email, mot_de_passe, cree_le
    FROM UTILISATEUR
    WHERE id = @id;
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateUser
    @id          INT,
    @nom_complet NVARCHAR(100),
    @email       NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE UTILISATEUR
    SET nom_complet = @nom_complet,
        email       = @email
    WHERE id = @id;

    SELECT id, nom_complet, email, mot_de_passe, cree_le
    FROM UTILISATEUR
    WHERE id = @id;
END
GO

CREATE OR ALTER PROCEDURE sp_CreateSession
    @token          NVARCHAR(512),
    @utilisateur_id INT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO SESSION (token, utilisateur_id)
    VALUES (@token, @utilisateur_id);

    SELECT id, token, utilisateur_id, cree_le
    FROM SESSION
    WHERE id = SCOPE_IDENTITY();
END
GO

CREATE OR ALTER PROCEDURE sp_GetSessionByToken
    @token NVARCHAR(512)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id, token, utilisateur_id, cree_le
    FROM SESSION
    WHERE token = @token;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteSessionByToken
    @token NVARCHAR(512)
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM SESSION WHERE token = @token;
END
GO

-- ============================================================
-- PROCEDURES STOCKEES — INGREDIENT
-- ============================================================

CREATE OR ALTER PROCEDURE sp_GetAllIngredients
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id, nom, description FROM INGREDIENT ORDER BY id;
END
GO

CREATE OR ALTER PROCEDURE sp_GetIngredientById
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id, nom, description FROM INGREDIENT WHERE id = @id;
END
GO

CREATE OR ALTER PROCEDURE sp_SearchIngredients
    @nom NVARCHAR(150)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id, nom, description
    FROM INGREDIENT
    WHERE nom LIKE '%' + @nom + '%';
END
GO

CREATE OR ALTER PROCEDURE sp_CreateIngredient
    @nom         NVARCHAR(150),
    @description NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO INGREDIENT (nom, description) VALUES (@nom, @description);
    SELECT id, nom, description FROM INGREDIENT WHERE id = SCOPE_IDENTITY();
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateIngredient
    @id          INT,
    @nom         NVARCHAR(150),
    @description NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE INGREDIENT SET nom = @nom, description = @description WHERE id = @id;
    SELECT id, nom, description FROM INGREDIENT WHERE id = @id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteIngredient
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM INGREDIENT WHERE id = @id;
END
GO

-- ============================================================
-- PROCEDURES STOCKEES — FREEZE_BEE
-- ============================================================

CREATE OR ALTER PROCEDURE sp_GetAllFreezebes
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        fb.id,
        fb.nom,
        fb.description,
        fb.prix_unitaire_HT,
        fb.gamme,
        fb.grammage,
        ISNULL(
            (SELECT STRING_AGG(CAST(fbi.ingredient_id AS NVARCHAR(10)), ',')
             FROM FREEZE_BEE_INGREDIENT fbi
             WHERE fbi.freeze_bee_id = fb.id),
        '') AS ingredientIds
    FROM FREEZE_BEE fb
    ORDER BY fb.id;
END
GO

CREATE OR ALTER PROCEDURE sp_GetFreezebeById
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        fb.id,
        fb.nom,
        fb.description,
        fb.prix_unitaire_HT,
        fb.gamme,
        fb.grammage,
        ISNULL(
            (SELECT STRING_AGG(CAST(fbi.ingredient_id AS NVARCHAR(10)), ',')
             FROM FREEZE_BEE_INGREDIENT fbi
             WHERE fbi.freeze_bee_id = fb.id),
        '') AS ingredientIds
    FROM FREEZE_BEE fb
    WHERE fb.id = @id;
END
GO

CREATE OR ALTER PROCEDURE sp_SearchFreezebes
    @nom NVARCHAR(150)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        fb.id,
        fb.nom,
        fb.description,
        fb.prix_unitaire_HT,
        fb.gamme,
        fb.grammage,
        ISNULL(
            (SELECT STRING_AGG(CAST(fbi.ingredient_id AS NVARCHAR(10)), ',')
             FROM FREEZE_BEE_INGREDIENT fbi
             WHERE fbi.freeze_bee_id = fb.id),
        '') AS ingredientIds
    FROM FREEZE_BEE fb
    WHERE fb.nom LIKE '%' + @nom + '%';
END
GO

CREATE OR ALTER PROCEDURE sp_CreateFreezebe
    @nom             NVARCHAR(150),
    @description     NVARCHAR(500),
    @prix_unitaire_HT FLOAT,
    @gamme           NVARCHAR(100),
    @grammage        INT,
    @ingredientIds   NVARCHAR(MAX)  -- JSON array ex: "[1,2,3]"
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO FREEZE_BEE (nom, description, prix_unitaire_HT, gamme, grammage)
    VALUES (@nom, @description, @prix_unitaire_HT, @gamme, @grammage);

    DECLARE @newId INT = SCOPE_IDENTITY();

    IF @ingredientIds IS NOT NULL AND @ingredientIds != '[]'
    BEGIN
        INSERT INTO FREEZE_BEE_INGREDIENT (freeze_bee_id, ingredient_id)
        SELECT @newId, CAST([value] AS INT)
        FROM OPENJSON(@ingredientIds);
    END

    EXEC sp_GetFreezebeById @newId;
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateFreezebe
    @id              INT,
    @nom             NVARCHAR(150),
    @description     NVARCHAR(500),
    @prix_unitaire_HT FLOAT,
    @gamme           NVARCHAR(100),
    @grammage        INT,
    @ingredientIds   NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE FREEZE_BEE
    SET nom              = @nom,
        description      = @description,
        prix_unitaire_HT = @prix_unitaire_HT,
        gamme            = @gamme,
        grammage         = @grammage
    WHERE id = @id;

    DELETE FROM FREEZE_BEE_INGREDIENT WHERE freeze_bee_id = @id;

    IF @ingredientIds IS NOT NULL AND @ingredientIds != '[]'
    BEGIN
        INSERT INTO FREEZE_BEE_INGREDIENT (freeze_bee_id, ingredient_id)
        SELECT @id, CAST([value] AS INT)
        FROM OPENJSON(@ingredientIds);
    END

    EXEC sp_GetFreezebeById @id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteFreezebe
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM FREEZE_BEE WHERE id = @id;
END
GO

-- ============================================================
-- PROCEDURES STOCKEES — PROCESSUS
-- ============================================================

CREATE OR ALTER PROCEDURE sp_GetAllProcesses
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id, nom, description, freeze_bee_id,
           etapes, validations_tests, descriptions_controle
    FROM PROCESSUS
    ORDER BY id;
END
GO

CREATE OR ALTER PROCEDURE sp_GetProcessById
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id, nom, description, freeze_bee_id,
           etapes, validations_tests, descriptions_controle
    FROM PROCESSUS
    WHERE id = @id;
END
GO

CREATE OR ALTER PROCEDURE sp_SearchProcesses
    @nom NVARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id, nom, description, freeze_bee_id,
           etapes, validations_tests, descriptions_controle
    FROM PROCESSUS
    WHERE nom LIKE '%' + @nom + '%';
END
GO

CREATE OR ALTER PROCEDURE sp_CreateProcess
    @nom                   NVARCHAR(200),
    @description           NVARCHAR(500),
    @freeze_bee_id         INT,
    @etapes                NVARCHAR(MAX),
    @validations_tests     NVARCHAR(MAX),
    @descriptions_controle NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO PROCESSUS (nom, description, freeze_bee_id, etapes, validations_tests, descriptions_controle)
    VALUES (@nom, @description, @freeze_bee_id, @etapes, @validations_tests, @descriptions_controle);

    SELECT id, nom, description, freeze_bee_id,
           etapes, validations_tests, descriptions_controle
    FROM PROCESSUS
    WHERE id = SCOPE_IDENTITY();
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateProcess
    @id                    INT,
    @nom                   NVARCHAR(200),
    @description           NVARCHAR(500),
    @freeze_bee_id         INT,
    @etapes                NVARCHAR(MAX),
    @validations_tests     NVARCHAR(MAX),
    @descriptions_controle NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE PROCESSUS
    SET nom                   = @nom,
        description           = @description,
        freeze_bee_id         = @freeze_bee_id,
        etapes                = @etapes,
        validations_tests     = @validations_tests,
        descriptions_controle = @descriptions_controle
    WHERE id = @id;

    SELECT id, nom, description, freeze_bee_id,
           etapes, validations_tests, descriptions_controle
    FROM PROCESSUS
    WHERE id = @id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteProcess
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM PROCESSUS WHERE id = @id;
END
GO

-- ============================================================
-- SEED DATA
-- ============================================================

SET IDENTITY_INSERT UTILISATEUR ON;
IF NOT EXISTS (SELECT 1 FROM UTILISATEUR WHERE id = 1)
    INSERT INTO UTILISATEUR (id, nom_complet, email, mot_de_passe, cree_le)
    VALUES (1, 'Alice Admin', 'alice@example.com', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '2024-01-01T00:00:00');
IF NOT EXISTS (SELECT 1 FROM UTILISATEUR WHERE id = 2)
    INSERT INTO UTILISATEUR (id, nom_complet, email, mot_de_passe, cree_le)
    VALUES (2, 'Bob User', 'bob@example.com', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '2024-01-02T00:00:00');
SET IDENTITY_INSERT UTILISATEUR OFF;
GO

SET IDENTITY_INSERT INGREDIENT ON;
IF NOT EXISTS (SELECT 1 FROM INGREDIENT WHERE id = 1)
    INSERT INTO INGREDIENT (id, nom, description) VALUES (1, 'Lait entier', 'Lait de vache entier pasteurisé');
IF NOT EXISTS (SELECT 1 FROM INGREDIENT WHERE id = 2)
    INSERT INTO INGREDIENT (id, nom, description) VALUES (2, 'Crème fraîche', 'Crème à 30% de matière grasse');
IF NOT EXISTS (SELECT 1 FROM INGREDIENT WHERE id = 3)
    INSERT INTO INGREDIENT (id, nom, description) VALUES (3, 'Sucre', 'Sucre cristallisé blanc');
SET IDENTITY_INSERT INGREDIENT OFF;
GO

SET IDENTITY_INSERT FREEZE_BEE ON;
IF NOT EXISTS (SELECT 1 FROM FREEZE_BEE WHERE id = 1)
    INSERT INTO FREEZE_BEE (id, nom, description, prix_unitaire_HT, gamme, grammage)
    VALUES (1, 'Glace Vanille Premium', 'Glace à la vanille de Madagascar', 4.5, 'Premium', 500);
IF NOT EXISTS (SELECT 1 FROM FREEZE_BEE WHERE id = 2)
    INSERT INTO FREEZE_BEE (id, nom, description, prix_unitaire_HT, gamme, grammage)
    VALUES (2, 'Sorbet Fraise', 'Sorbet à la fraise de saison', 3.2, 'Standard', 350);
SET IDENTITY_INSERT FREEZE_BEE OFF;
GO

IF NOT EXISTS (SELECT 1 FROM FREEZE_BEE_INGREDIENT WHERE freeze_bee_id = 1 AND ingredient_id = 1)
    INSERT INTO FREEZE_BEE_INGREDIENT VALUES (1, 1);
IF NOT EXISTS (SELECT 1 FROM FREEZE_BEE_INGREDIENT WHERE freeze_bee_id = 1 AND ingredient_id = 2)
    INSERT INTO FREEZE_BEE_INGREDIENT VALUES (1, 2);
IF NOT EXISTS (SELECT 1 FROM FREEZE_BEE_INGREDIENT WHERE freeze_bee_id = 1 AND ingredient_id = 3)
    INSERT INTO FREEZE_BEE_INGREDIENT VALUES (1, 3);
IF NOT EXISTS (SELECT 1 FROM FREEZE_BEE_INGREDIENT WHERE freeze_bee_id = 2 AND ingredient_id = 3)
    INSERT INTO FREEZE_BEE_INGREDIENT VALUES (2, 3);
GO

SET IDENTITY_INSERT PROCESSUS ON;
IF NOT EXISTS (SELECT 1 FROM PROCESSUS WHERE id = 1)
    INSERT INTO PROCESSUS (id, nom, description, freeze_bee_id, etapes, validations_tests, descriptions_controle)
    VALUES (
        1, 'Procédé Pasteurisation Vanille', 'Procédé de fabrication de la glace vanille', 1,
        N'["Mélanger lait et crème à 4°C","Chauffer à 85°C pendant 15s","Refroidir à 4°C","Turbiner à -6°C","Conditionner et surgeler à -18°C"]',
        N'["Contrôle température pasteurisation","Contrôle microbiologique J+1","Contrôle texture turbinage"]',
        N'["Vérification pH entre 6.5 et 7.0","Absence de coliformes totaux"]'
    );
SET IDENTITY_INSERT PROCESSUS OFF;
GO

PRINT 'killer_bee — base de données initialisée avec succès.';
GO
