# killer-bee

Application web full-stack en architecture **microservices**. Chaque service est indépendant, déployé dans son propre conteneur Docker, et communique via un réseau interne chiffré. L'authentification repose sur un **Active Directory** (LDAP) avec mapping de groupes vers rôles SQL.

---

## Table des matières

1. [Architecture globale](#architecture-globale)
2. [Structure du projet](#structure-du-projet)
3. [Services backend](#services-backend)
4. [Authentification LDAP & JWT](#authentification-ldap--jwt)
5. [Chiffrement E2E](#chiffrement-e2e-bout-en-bout)
6. [Frontend](#frontend)
7. [Gateway Traefik](#gateway-traefik)
8. [Docker](#docker)
9. [Logging RFC 5424](#logging-rfc-5424)
10. [Variables d'environnement](#variables-denvironnement)
11. [État actuel](#état-actuel)
12. [Conventions](#conventions)

---

## Architecture globale

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           UTILISATEUR                                   │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ HTTP :80
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                 GATEWAY  Traefik v3.0  (killer-bee-gateway)             │
│                                                                         │
│  Middlewares : rate-limit (100 req/s), secure-headers, compress         │
│                                                                         │
│  PathPrefix(/)              → frontend:80                               │
│  PathPrefix(/api/auth)      → auth-service:3001                         │
│  PathPrefix(/api/users)     → user-service:3002                         │
│  PathPrefix(/api/ingredients) → ingredient-service:3003                 │
│  PathPrefix(/api/freezbe)   → freezbe-service:3004                      │
│  PathPrefix(/api/processes) → process-service:3005                      │
└────┬──────────────────────────────────────────────────────┬─────────────┘
     │                                                      │
     ▼                                                      ▼
┌──────────────────────┐         ┌──────────────────────────────────────┐
│  FRONTEND  nginx:80  │         │  MICROSERVICES  (réseau Docker app)  │
│  (SPA React + Vite)  │         │                                      │
│                      │         │  auth-service        :3001           │
│  Tout le trafic API  │         │  user-service        :3002           │
│  passe par le client │         │  ingredient-service  :3003           │
│  HTTP chiffré        │         │  freezbe-service     :3004           │
└──────────────────────┘         │  process-service     :3005           │
                                 └───────────────┬──────────────────────┘
                                                 │
                                  inter-service HTTP (interne)
                                  process-service ──► freezbe-service
                                                 │
                                                 ▼
                                  Active Directory / LDAP  (auth uniquement)
```

**Flux réseau complet — connexion utilisateur :**

```
Navigateur
    │ [body chiffré Base64]
    │ POST /api/auth/login
    ▼
  Traefik:80
    │ rate-limit + secure-headers
    ▼
  auth-service:3001
    │ déchiffre body  → { username, password }
    │ bind LDAP UPN   → Active Directory
    │ récupère groupes AD → mappe rôle SQL
    │ génère JWT HS256
    │ chiffre réponse → { access_token, full_name, username }
    ▼
  Navigateur
    │ stocke token (localStorage)
    │ toutes les requêtes suivantes : Authorization: Bearer <token>
```

---

## Structure du projet

```
killer-bee/
├── services/
│   ├── auth-service/          # Authentification LDAP/AD → JWT        :3001
│   ├── user-service/          # Gestion des profils utilisateurs        :3002
│   ├── ingredient-service/    # CRUD ingrédients                        :3003
│   ├── freezbe-service/       # CRUD modèles Freezbe                    :3004
│   └── process-service/       # CRUD procédés (dépend freezbe-service)  :3005
├── frontend/                  # Application React + Vite + nginx
├── gateway/
│   ├── traefik/traefik.yml    # Config principale Traefik (logs, entryPoints)
│   └── dynamic/
│       ├── routers.yml        # Règles de routage par PathPrefix
│       ├── services.yml       # Cibles des services
│       └── middlewares.yml    # rate-limit, secure-headers, compress
├── middleware-local/          # Librairie npm partagée
├── docker-compose.yml         # Orchestration locale (7 conteneurs + syslog)
└── .env.example               # Variables d'environnement à configurer
```

### Structure interne des services (identique pour chaque service)

```
services/<nom>/src/
├── config/
│   ├── env.ts              # Variables d'environnement typées
│   └── server.ts           # Express : healthcheck + middlewares + routes
├── routes/                 # Déclaration des endpoints
├── controllers/            # Parsing HTTP → service → réponse
├── services/               # Logique métier + audit
├── repositories/           # Accès données (mock en mémoire, prêt pour MSSQL)
├── mock-data/              # Données de démonstration en mémoire
├── dto/                    # Formats d'échange API (Request / Response)
├── models/                 # Types métier internes
├── mappers/                # Record → Model → DTO
├── middlewares/
│   ├── auth.middleware.ts  # Vérification JWT (tous endpoints sauf login)
│   ├── cipher.middleware.ts # Override res.json() (chiffre) + parsing body (déchiffre)
│   └── error.middleware.ts # Transformation exceptions → réponse HTTP
├── security/
│   ├── crypto/cipher.ts    # Algorithme composite : Vigenère + transposition + XOR
│   └── audit/audit.logger.ts # Journalisation événements sensibles (login, accès)
└── utils/
    ├── asyncHandler.ts
    ├── generateToken.ts    # JWT HS256
    ├── hashPassword.ts
    └── logger.ts           # Winston RFC 5424 (8 niveaux)
```

---

## Services backend

### Endpoints

| Service                    | Port | Routes                                                                          |
|----------------------------|------|---------------------------------------------------------------------------------|
| **auth-service**           | 3001 | `POST /api/auth/login`, `POST /api/auth/logout`                                 |
| **user-service**           | 3002 | `GET /api/users/:id`, `PUT /api/users/:id`                                      |
| **ingredient-service**     | 3003 | `GET /api/ingredients`, `GET /api/ingredients/search`, `GET /api/ingredients/:id`, `POST /api/ingredients`, `PUT /api/ingredients/:id`, `DELETE /api/ingredients/:id` |
| **freezbe-service**        | 3004 | `GET /api/freezbe`, `GET /api/freezbe/search`, `GET /api/freezbe/:id`, `POST /api/freezbe`, `PUT /api/freezbe/:id`, `DELETE /api/freezbe/:id` |
| **process-service**        | 3005 | `GET /api/processes`, `GET /api/processes/search`, `GET /api/processes/:id`, `POST /api/processes`, `PUT /api/processes/:id`, `DELETE /api/processes/:id` |

Tous les services exposent `GET /health` (utilisé par Docker et Traefik pour les healthchecks).

### Modèle Freezbe

```typescript
type Freezbe = {
  id:          number
  nom:         string
  description: string
  pUHT:        number        // Prix unitaire HT
  gamme:       string
  ingredients: Ingredient[]  // Relation
  grammage:    number
}
```

### Communication inter-services

`process-service` appelle `freezbe-service` pour valider qu'un modèle existe avant de créer un procédé :

```
POST /api/processes
    │
    ▼ ProcessService.create()
    │  interGet(FREEZBE_SERVICE_URL + /api/freezbe/:id)
    │    ├── 200 OK → procédé créé
    │    └── 404 Not Found → 404 refusé (modèle inexistant)
    ▼
```

Variable d'environnement : `FREEZBE_SERVICE_URL=http://freezbe-service:3004`

### Flux d'une requête backend

```
[body chiffré Base64]  POST /api/auth/login
    │
    ▼ cipher.middleware  →  déchiffre le body  →  { username, password }
    ▼ routes/auth.routes.ts
    ▼ controllers/AuthController.ts
    ▼ services/AuthService.ts     (audit : logLoginAttempt)
    ▼ services/ldap.service.ts    (bind UPN → Active Directory)
    ▼ generateToken()             (JWT HS256, rôle + schéma mappés)
    ▼ mappers/auth.mapper.ts      (LoginResponseDTO)
    ▼ cipher.middleware           →  chiffre la réponse JSON
    │
    └─► [Base64 chiffré]  { access_token, full_name, username }
```

---

## Authentification LDAP & JWT

### Vue d'ensemble

L'authentification repose sur un **Active Directory** (LDAP) : les credentials ne sont jamais stockés dans l'application. Le service `auth-service` valide les credentials directement auprès de l'AD, récupère les groupes de l'utilisateur, et émet un JWT.

```
┌─────────────┐          ┌──────────────────┐          ┌──────────────────────┐
│  Navigateur │          │   auth-service   │          │   Active Directory   │
└──────┬──────┘          └────────┬─────────┘          └──────────┬───────────┘
       │  POST /api/auth/login    │                               │
       │  { username, password }  │                               │
       │─────────────────────────►│                               │
       │                          │  Bind UPN                     │
       │                          │  user@killerbee.local         │
       │                          │──────────────────────────────►│
       │                          │  ✓ credentials valides        │
       │                          │◄──────────────────────────────│
       │                          │  Search (sAMAccountName)      │
       │                          │──────────────────────────────►│
       │                          │  displayName, mail, memberOf  │
       │                          │◄──────────────────────────────│
       │  JWT HS256               │  Mappe groupe → rôle SQL      │
       │◄─────────────────────────│  Génère token                 │
```

### Mapping groupes AD → rôles

| Groupe AD  | Rôle JWT | Schéma SQL |
|------------|----------|------------|
| `GRP_RD`   | `rd`     | `SCH_RD`   |
| `GRP_TEST` | `test`   | `SCH_TEST` |
| `GRP_PROD` | `prod`   | `SCH_PROD` |
| `GRP_DBA`  | `admin`  | `dbo`      |
| *(aucun)*  | `user`   | `SCH_USR`  |

### Payload JWT

```typescript
{
  sub:       string   // sAMAccountName (username AD)
  full_name: string   // displayName AD
  email:     string   // mail AD
  role:      'rd' | 'test' | 'prod' | 'admin' | 'user'
  schema:    'SCH_RD' | 'SCH_TEST' | 'SCH_PROD' | 'dbo' | 'SCH_USR'
}
```

Algorithme : **HS256** — Secret : `JWT_SECRET` (min. 32 caractères)

### Protection des endpoints

`auth.middleware.ts` est appliqué sur tous les endpoints **sauf** `POST /api/auth/login`. Il vérifie le header `Authorization: Bearer <token>` et rejette avec `401` si le token est absent, invalide ou expiré.

---

## Chiffrement E2E (bout en bout)

Toutes les communications entre le navigateur et les services backend sont chiffrées avec un algorithme composite à **3 couches**. La clé (`CIPHER_KEY`) est la même côté backend et frontend (injectée au build Docker).

### Algorithme

```
Texte clair
    │
    ▼  1. Vigenère (substitution)
    │     Chaque caractère décalé de keyBytes[i % kLen] dans l'espace 0-255
    │
    ▼  2. Transposition par colonne
    │     Matrice de colCount = (keyBytes[0] % 3) + 3 colonnes
    │     Colonnes réordonnées selon argsort(keyBytes[0..colCount])
    │     Padding nul pour aligner sur colCount — padLen stocké en tête
    │
    ▼  3. XOR
    │     Chaque caractère XORé avec keyBytes[kLen-1-(i%kLen)]
    │
    ▼  4. Base64
    │     [ padLen (1 octet) | texte XORé ] → base64
    │
    └─► Texte chiffré (Base64, transmis en Content-Type: text/plain)
```

Le déchiffrement s'applique dans l'ordre inverse : Base64 → XOR → transposition inverse → Vigenère inverse.

### Où s'applique le chiffrement

| Couche     | Fichier                                             | Rôle                                              |
|------------|-----------------------------------------------------|---------------------------------------------------|
| Backend    | `services/*/src/security/crypto/cipher.ts`          | `encrypt()` / `decrypt()`                         |
| Frontend   | `frontend/src/security/cipher.js`                   | Version navigateur (btoa/atob au lieu de Buffer)  |
| Middleware | `services/*/src/middlewares/cipher.middleware.ts`   | Override `res.json()` + parsing body auto          |
| Client HTTP| `frontend/src/api/client.js`                        | Chiffre body avant envoi, déchiffre réponse       |

**Important** : le body est transmis en `Content-Type: text/plain` (pas `application/json`) car le contenu est une chaîne Base64 opaque.

---

## Frontend

### Architecture

```
App.js
├── AuthContext      { user, session, isAuthenticated }
├── AppContext        état global de l'application
├── RouterContext     état de navigation
├── ToastContext      notifications
└── Rendu conditionnel :
    ├── isAuthenticated → DashboardPage
    └── sinon          → LoginPage
```

### Structure

```
frontend/src/
├── ui/
│   ├── pages/
│   │   ├── LoginPage.js       # Formulaire de connexion
│   │   ├── DashboardPage.js   # Accueil authentifié
│   │   ├── FreezebePage.js    # CRUD modèles Freezbe
│   │   ├── IngredientPage.js  # CRUD ingrédients
│   │   ├── ProcessPage.js     # CRUD procédés
│   │   └── ProfilePage.js     # Profil utilisateur
│   └── components/            # Button, Input, LoginForm, Navbar, ToastContainer, ConfirmDialog
├── api/
│   ├── client.js              # Client HTTP — chiffrement/déchiffrement transparent
│   ├── auth.api.js
│   ├── user.api.js
│   ├── freezbe.api.js
│   ├── ingredient.api.js
│   └── process.api.js
├── hooks/
│   ├── useLogin.js / useLogout.js
│   ├── useFreezebes.js / useIngredients.js / useProcesses.js
│   └── useUser.js
├── store/
│   ├── auth.store.js          # user, session, isAuthenticated
│   ├── app.store.js
│   ├── router.store.js
│   └── toast.store.js
├── security/
│   ├── cipher.js              # Algorithme composite — version navigateur
│   └── token.registry.js      # get/set token → localStorage
├── dto/                       # Types des réponses backend
├── models/                    # Types métier (User, Session, Freezbe, …)
├── mappers/                   # DTO → Model (auth, user, freezbe, ingredient, process)
└── utils/                     # formatDate, generateSlug, validate
```

### Flux d'une donnée frontend

```
Utilisateur (clic "Connexion")
    │
    ▼ ui/components/LoginForm.js
    ▼ hooks/useLogin.js
    ▼ api/auth.api.js
    ▼ api/client.js ──[chiffre body]──► Traefik:80 ──► auth-service:3001
                    ◄──[réponse chiffrée]─────────────────────────────────
    ▼ api/client.js         (déchiffre)
    ▼ mappers/auth.mapper.js (LoginResponseDTO → { User, Session })
    ▼ store/auth.store.js   (setUser + setSession → localStorage)
    ▼ DashboardPage         (re-render)
```

### Token Registry

```javascript
// frontend/src/security/token.registry.js
getToken()    → localStorage.getItem('access_token')
setToken(tok) → localStorage.setItem('access_token', tok)
```

---

## Gateway Traefik

### Configuration principale (`gateway/traefik/traefik.yml`)

```yaml
entryPoints:
  web: ":80"

providers:
  file:
    directory: /etc/traefik/dynamic
    watch: true            # rechargement à chaud des règles

log:
  level: DEBUG
  format: json
  filePath: /logs/traefik.log

accessLog:
  filePath: /logs/access.log
  format: json
  fields:
    headers:
      Authorization: redact  # jamais de token dans les logs
      Cookie: redact
      X-Request-Id: keep
      X-Forwarded-For: keep
```

### Routeurs (`gateway/dynamic/routers.yml`)

| Routeur              | Règle                           | Middlewares                        |
|----------------------|---------------------------------|------------------------------------|
| `auth-router`        | `PathPrefix(/api/auth)`         | rate-limit, secure-headers         |
| `user-router`        | `PathPrefix(/api/users)`        | rate-limit, secure-headers         |
| `ingredient-router`  | `PathPrefix(/api/ingredients)`  | rate-limit, secure-headers         |
| `freezbe-router`     | `PathPrefix(/api/freezbe)`      | rate-limit, secure-headers         |
| `process-router`     | `PathPrefix(/api/processes)`    | rate-limit, secure-headers         |
| `frontend-router`    | `PathPrefix(/)`                 | secure-headers, compress           |

### Middlewares (`gateway/dynamic/middlewares.yml`)

| Middleware       | Configuration                                             |
|------------------|-----------------------------------------------------------|
| `secure-headers` | `X-Frame-Options: DENY`, `nosniff`, XSS-Protection, Referrer-Policy |
| `rate-limit`     | 100 req/s moyen, burst 50                                 |
| `compress`       | Compression gzip                                          |

---

## Docker

### Conteneurs

| Conteneur                       | Image          | Port interne | Exposé |
|---------------------------------|----------------|--------------|--------|
| `killer-bee-gateway`            | traefik:v3.0   | 80           | **80** |
| `killer-bee-frontend`           | nginx:alpine   | 80           | —      |
| `killer-bee-auth`               | node:20-alpine | 3001         | —      |
| `killer-bee-user`               | node:20-alpine | 3002         | —      |
| `killer-bee-ingredient`         | node:20-alpine | 3003         | —      |
| `killer-bee-freezbe`            | node:20-alpine | 3004         | —      |
| `killer-bee-process`            | node:20-alpine | 3005         | —      |

Seul le port **80** (gateway) est accessible depuis l'hôte. Les services backend communiquent exclusivement via le réseau Docker interne `app`.

### Logging syslog

Tous les conteneurs envoient leurs logs vers un collecteur syslog local :

```yaml
logging:
  driver: syslog
  options:
    syslog-address: "udp://127.0.0.1:514"
    syslog-facility: "local0"
    tag: "{{.Name}}"
```

### Healthchecks

Tous les services backend sont surveillés via `GET /health` :

```
Intervalle : 15s  |  Timeout : 5s  |  Retries : 3  |  Start period : 20s
Test : wget -qO- http://localhost:{PORT}/health
```

Le gateway attend que tous les services soient `healthy` avant de démarrer (`depends_on: condition: service_healthy`).

### Démarrage local

```bash
# 1. Configurer les variables d'environnement
cp .env.example .env
# Renseigner toutes les valeurs (voir section Variables d'environnement)

# 2. Construire et démarrer tous les conteneurs
docker compose up --build

# Application disponible sur http://localhost
```

### Commandes utiles

```bash
# Reconstruire un service spécifique
docker compose up --build auth-service

# Voir les logs d'un service
docker compose logs -f process-service

# Arrêter et supprimer les conteneurs
docker compose down

# Arrêter et supprimer volumes + images
docker compose down -v --rmi local
```

### Architecture des images (multi-stage)

**Services backend** (`services/*/Dockerfile`) :

```
Stage 1 — builder (node:20-alpine)
    npm install
    tsc → dist/

Stage 2 — final (node:20-alpine)
    npm install --omit=dev
    COPY dist/
    CMD ["node", "dist/index.js"]
```

**Frontend** (`frontend/Dockerfile`) :

```
Stage 1 — builder (node:20-alpine)
    ARG VITE_CIPHER_KEY         ← injecté au build depuis .env
    npm install --include=dev
    vite build → dist/

Stage 2 — final (nginx:alpine)
    COPY dist/ → /usr/share/nginx/html
    nginx.conf (SPA routing : try_files $uri /index.html)
```

> La clé `VITE_CIPHER_KEY` est **injectée dans le bundle JS au moment du build**. Changer la clé nécessite un rebuild de l'image frontend.

---

## Logging RFC 5424

Tous les services utilisent **Winston** avec les 8 niveaux RFC 5424 :

| Niveau | Méthode      | Usage                                              |
|--------|--------------|----------------------------------------------------|
| 0      | `log.emerg`  | Système inutilisable                               |
| 1      | `log.alert`  | Action immédiate (ex. brute-force détecté)         |
| 2      | `log.crit`   | Défaillance critique (connexion DB perdue)         |
| 3      | `log.error`  | Erreur récupérable                                 |
| 4      | `log.warn`   | Anomalie client (credentials invalides)            |
| 5      | `log.notice` | Événement métier (login réussi, CRUD)              |
| 6      | `log.info`   | Flux normal                                        |
| 7      | `log.debug`  | Diagnostic (bind LDAP, déchiffrement, ...)         |

Chaque entrée de log inclut : `{ category, timestamp, service, ...metadata }`

**Catégories** : `access` (LDAP/auth), `audit` (login/logout), `operation` (CRUD), `communication` (inter-services).

**Audit logger** (`security/audit/audit.logger.ts`) :
- `logLoginAttempt(username)` — à chaque tentative de connexion
- `logLoginSuccess(username)` — après bind LDAP réussi
- `logLoginFailure(username, reason)` — credentials invalides ou erreur LDAP

---

## Variables d'environnement

Copier `.env.example` en `.env` et renseigner toutes les valeurs vides.

```env
# ── Base de données SQL Server ──────────────────────────────────
# Adresse IP du serveur Windows SQL Server (pas un conteneur Docker)
DB_HOST=
DB_PORT=1433
DB_NAME=killer_bee
DB_USER=           # Compte applicatif LOGIN_APP (créé dans init.sql)
DB_PASSWORD=

# ── Authentification JWT ────────────────────────────────────────
# Chaîne aléatoire de 32+ caractères
# Exemple : openssl rand -hex 32
JWT_SECRET=

# ── Chiffrement applicatif ──────────────────────────────────────
# Clé partagée entre tous les microservices ET le frontend
# CIPHER_KEY      → injectée à l'exécution dans les services backend
# VITE_CIPHER_KEY → injectée à la COMPILATION du frontend (doit être identique)
# Longueur : 16 à 32 caractères ASCII
CIPHER_KEY=
VITE_CIPHER_KEY=

# ── Active Directory / LDAP ─────────────────────────────────────
# LDAP_URL     : adresse ldap:// de la VM AD (ex. ldap://192.168.1.x:389)
# LDAP_DOMAIN  : domaine AD (ex. killerbee.local)
# LDAP_BASE_DN : base de recherche (ex. DC=killerbee,DC=local)
LDAP_URL=ldap://192.168.x.x:389
LDAP_DOMAIN=killerbee.local
LDAP_BASE_DN=DC=killerbee,DC=local
```

> Les variables LDAP ne sont utilisées que par `auth-service`. Elles ne figurent pas dans le `docker-compose.yml` root — les ajouter manuellement dans la section `environment` de `auth-service` si nécessaire.

---

## Déploiement production (Proxmox — 4 VMs)

```
┌─────────────────────────────────────────────────────────────┐
│  VM-GATEWAY  Traefik  :80/:443 (exposée réseau)             │
│    ├─► VM-FRONT   nginx  :80   (réseau interne)             │
│    └─► VM-BACK    Node.js :3001-3005  (réseau interne)      │
│              └─► VM-BDD   MSSQL Server :1433 (réseau interne)│
└─────────────────────────────────────────────────────────────┘
```

Voir `DEPLOIEMENT.md` pour le guide complet (création des VMs, initialisation SQL, PM2, certificats TLS).

---

## État actuel

| Composant              | État                  | Notes                                                    |
|------------------------|-----------------------|----------------------------------------------------------|
| Frontend               | Fonctionnel           | Pages CRUD : Freezbe, Ingrédients, Procédés, Profil      |
| Microservices (×5)     | Fonctionnels          | Données mock en mémoire (repositories prêts pour MSSQL)  |
| Authentification LDAP  | Intégré               | Bind UPN direct, mapping groupes AD → rôles SQL + JWT    |
| Chiffrement E2E        | Actif                 | Vigenère + transposition + XOR sur tout le trafic        |
| Base de données MSSQL  | Non branchée          | DB_HOST vide — repositories opérationnels, mock actif    |
| Gateway Traefik        | Configuré             | Routage, rate-limit, secure-headers, logs JSON           |
| Docker / syslog        | Opérationnel          | 7 conteneurs avec healthchecks et collecte syslog        |

---

## Conventions

- **Branches** : `feature/`, `fix/`, `refactor/`, `hotfix/`, `docs/`
- **Commits** : [Conventional Commits](https://www.conventionalcommits.org/) — `feat(scope): description`
- **Versioning** : [Semantic Versioning](https://semver.org/) — `MAJOR.MINOR.PATCH`
- **Nommage** : PascalCase (composants/classes), camelCase (variables/fonctions), UPPER_SNAKE_CASE (constantes)
