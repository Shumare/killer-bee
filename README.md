# killer-bee

Application web full-stack en architecture **microservices**. Chaque service est indépendant, déployé dans son propre conteneur Docker, et communique via un réseau interne chiffré.

---

## Architecture globale

```
┌──────────────────────────────────────────────────────────────────┐
│                          UTILISATEUR                             │
└──────────────────────────────┬───────────────────────────────────┘
                               │ HTTP :80
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│              GATEWAY  Traefik:80  (killer-bee-gateway)           │
│                                                                  │
│   /*       → frontend:80      (secure-headers, compress)         │
│   /api/*   → services:3001-3005  (rate-limit, secure-headers)    │
└───────────┬──────────────────────────────────────────────────────┘
            │
            ├──────────────────────────────────────┐
            ▼                                      ▼
┌───────────────────────┐             ┌────────────────────────────┐
│  FRONTEND  nginx:80   │             │  MICROSERVICES             │
│  killer-bee-frontend  │             │                            │
│                       │             │  auth-service      :3001   │
│  /* → React SPA       │             │  user-service      :3002   │
│  /api/* → proxy       │             │  ingredient-service :3003  │
└───────────────────────┘             │  freezbe-service   :3004   │
                                      │  process-service   :3005   │
                                      └────────────────────────────┘
                                               │ inter-service HTTP
                                               │ (chiffré)
                                      process ─┘─► freezbe
```

> En **développement local**, nginx proxyfie `/api/*` directement vers les services. En **production**, Traefik assure le routage et la terminaison TLS.

---

## Structure du projet

```
killer-bee/
├── services/
│   ├── auth-service/          # Authentification JWT
│   ├── user-service/          # Gestion des profils
│   ├── ingredient-service/    # CRUD ingrédients
│   ├── freezbe-service/       # CRUD modèles Freezbe
│   └── process-service/       # CRUD procédés (appelle freezbe-service)
├── frontend/                  # Application React + Vite
├── gateway/                   # Configuration Traefik (production)
├── middleware-local/          # Librairie npm partagée (normalisation des réponses)
├── docker-compose.yml         # Orchestration locale (6 conteneurs)
└── .env.example               # Variables d'environnement à configurer
```

---

## Services

### Endpoints

| Service              | Port | Routes principales                                             |
|----------------------|------|----------------------------------------------------------------|
| **auth-service**     | 3001 | `POST /api/auth/login`, `POST /api/auth/logout`                |
| **user-service**     | 3002 | `GET/PUT /api/users/:id`                                       |
| **ingredient-service** | 3003 | `GET/POST /api/ingredients`, `GET/PUT/DELETE /api/ingredients/:id` |
| **freezbe-service**  | 3004 | `GET/POST /api/freezbe`, `GET/PUT/DELETE /api/freezbe/:id`     |
| **process-service**  | 3005 | `GET/POST /api/processes`, `GET/PUT/DELETE /api/processes/:id` |

Tous les services exposent également `GET /health`.

### Structure interne (identique pour chaque service)

```
services/<nom>/src/
├── config/            # env.ts, server.ts (Express + middlewares)
├── routes/            # Déclaration des endpoints
├── controllers/       # Parsing HTTP → appel service → réponse
├── services/          # Logique métier
├── repositories/      # Accès données (mock en mémoire, prêt pour MSSQL)
├── mock-data/         # Données de démonstration en mémoire
├── dto/               # Formats d'échange API (Request / Response)
├── models/            # Objets métier internes
├── mappers/           # Transformations Record → Model → DTO
├── middlewares/
│   ├── auth.middleware.ts    # Vérification JWT (tous endpoints sauf login)
│   ├── cipher.middleware.ts  # Chiffrement/déchiffrement automatique
│   └── error.middleware.ts   # Gestion centralisée des erreurs
├── security/
│   ├── crypto/cipher.ts      # Algorithme composite (Vigenère + transposition + XOR)
│   └── audit/audit.logger.ts # Journalisation des événements sensibles
└── utils/             # asyncHandler, logger (Winston), generateToken, hashPassword
```

### Flux d'une requête backend

```
POST /api/auth/login
    │
    ▼ cipher.middleware (déchiffre le body)
    ▼ routes/auth.routes.ts
    ▼ controllers/AuthController.ts
    ▼ services/AuthService.ts  (audit log)
    ▼ repositories/UserRepository.ts
    ▼ mock-data/user.mock.ts
    ▼ mappers/auth.mapper.ts  (Record → LoginResponseDTO)
    ▼ cipher.middleware (chiffre la réponse)
    │
    └─► { access_token, user_id, full_name }  [chiffré]
```

---

## Frontend

### Rôle

Interface React/TypeScript. Tout le trafic vers le backend passe par `api/client.ts` qui chiffre les requêtes et déchiffre les réponses de façon transparente.

### Structure

```
frontend/src/
├── ui/
│   ├── pages/         # LoginPage, DashboardPage, FreezebePage,
│   │                  # IngredientPage, ProcessPage, ProfilePage
│   ├── components/    # Button, Input, LoginForm, Navbar, …
│   └── widgets/       # AuthLayout, DashboardHeader, Sidebar
├── api/
│   ├── client.ts          # Client HTTP (chiffrement transparent)
│   ├── auth.api.ts
│   ├── user.api.ts
│   ├── freezbe.api.ts
│   ├── ingredient.api.ts
│   └── process.api.ts
├── dto/               # Types des réponses backend
├── models/            # Types métier frontend (User, Session)
├── mappers/           # DTO → Model
├── hooks/             # useLogin, useLogout, useUser, useFreezebes, …
├── store/             # Contexte global (auth.store, app.store, router.store)
├── security/          # Guards d'accès, cipher.ts (version navigateur)
└── utils/             # Fonctions pures (formatDate, …)
```

### Flux d'une donnée frontend

```
Utilisateur (clic)
    ▼ ui/components/LoginForm.tsx
    ▼ hooks/useLogin.ts
    ▼ api/auth.api.ts
    ▼ api/client.ts  ──[body chiffré]──►  nginx  ──►  auth-service:3001
                     ◄──[réponse chiffrée]──────────────────────────────
    ▼ api/client.ts  (déchiffrement)
    ▼ mappers/auth.mapper.ts  (DTO → User + Session)
    ▼ store/auth.store.ts
    ▼ DashboardPage  (re-render)
```

---

## Sécurité

### Chiffrement applicatif (bout en bout)

Toutes les communications client-serveur et inter-services sont chiffrées avec un algorithme composite à 3 couches :

1. **Vigenère (substitution)** — décalage adaptatif par clé partagée
2. **Transposition par colonne** — réorganisation matricielle (3-5 colonnes selon la clé)
3. **XOR** — chiffrement symétrique final

Le résultat est encodé en **Base64**. La même clé (`CIPHER_KEY`) est utilisée côté backend ; `VITE_CIPHER_KEY` est injectée dans le bundle frontend au moment du build Docker.

| Composant | Fichier | Rôle |
|-----------|---------|------|
| Backend | `services/*/src/security/crypto/cipher.ts` | `encrypt()` / `decrypt()` |
| Frontend | `frontend/src/security/cipher.ts` | Version navigateur (btoa/atob) |
| Middleware backend | `cipher.middleware.ts` | Override automatique `res.json()` + parsing body |
| Client HTTP frontend | `api/client.ts` | Chiffre le body, déchiffre la réponse |

### Authentification

- JWT HS256 avec `JWT_SECRET` (min. 32 caractères)
- Token transmis via `Authorization: Bearer <token>`
- Vérifié par `auth.middleware.ts` sur tous les endpoints protégés

### Gateway (production)

| Middleware       | Rôle                                             |
|------------------|--------------------------------------------------|
| `secure-headers` | X-Frame-Options, X-XSS-Protection, nosniff      |
| `rate-limit`     | 100 req/s moyen, burst 50                        |
| `compress`       | Compression gzip des réponses                    |

---

## Docker

### Conteneurs

| Conteneur                      | Image           | Port interne | Exposé |
|-------------------------------|-----------------|--------------|--------|
| `killer-bee-gateway`           | traefik:v3.0    | 80           | 80     |
| `killer-bee-frontend`          | nginx:alpine    | 80           | —      |
| `killer-bee-auth-service`      | node:20-alpine  | 3001         | —      |
| `killer-bee-user-service`      | node:20-alpine  | 3002         | —      |
| `killer-bee-ingredient-service`| node:20-alpine  | 3003         | —      |
| `killer-bee-freezbe-service`   | node:20-alpine  | 3004         | —      |
| `killer-bee-process-service`   | node:20-alpine  | 3005         | —      |

Seul le port 80 (gateway) est accessible depuis l'hôte. Les services backend communiquent via le réseau Docker interne `app`.

### Démarrage local

```bash
# 1. Configurer les variables d'environnement
cp .env.example .env
# Renseigner DB_HOST, DB_PASSWORD, JWT_SECRET, CIPHER_KEY, VITE_CIPHER_KEY

# 2. Construire et démarrer les 6 conteneurs
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
```

### Architecture des images (multi-stage)

**Services backend** (`services/*/Dockerfile`) :
```
node:20-alpine (builder)  →  npm install + tsc
node:20-alpine (final)    →  npm install --omit=dev + dist/
```

**Frontend** (`frontend/Dockerfile`) :
```
node:20-alpine (builder)  →  npm install --include=dev + vite build
                              ARG VITE_CIPHER_KEY injecté dans le bundle JS
nginx:alpine (final)      →  dist/ + nginx.conf (SPA routing)
```

### Healthchecks

Tous les services sont surveillés via `GET /health` :
- Intervalle : 15s
- Timeout : 5s
- Retries : 3
- Start period : 20s

---

## Variables d'environnement

```env
# Base de données SQL Server
DB_HOST=           # IP / hostname du serveur MSSQL
DB_PORT=1433
DB_NAME=killer_bee
DB_USER=           # ex. LOGIN_APP
DB_PASSWORD=

# Authentification
JWT_SECRET=        # Chaîne aléatoire de 32+ caractères

# Chiffrement applicatif
CIPHER_KEY=        # Clé partagée backend (16-32 caractères)
VITE_CIPHER_KEY=   # Même valeur — injectée dans le bundle frontend au build
```

---

## Déploiement production (Proxmox — 4 VMs)

```
VM-GATEWAY  (Traefik, port 80/443)
    ├─► VM-FRONT  (nginx, port 80 interne)
    └─► VM-BACK   (Node.js services, ports 3001-3005 internes)
            └─► VM-BDD  (MSSQL Server, port 1433 interne)
```

Voir `DEPLOIEMENT.md` pour le guide complet (création des VMs, init SQL, PM2, certificats TLS).

---

## État actuel

| Composant            | État                    | Notes                                              |
|----------------------|-------------------------|----------------------------------------------------|
| Frontend             | Fonctionnel             | Pages Freezbe, Ingrédients, Procédés avec CRUD     |
| Microservices (×5)   | Fonctionnels            | Données mock en mémoire                            |
| Chiffrement E2E      | Actif                   | Vigenère + transposition + XOR sur tout le trafic  |
| Base de données      | Non branchée            | Repositories prêts pour MSSQL Server               |
| Gateway Traefik      | Configuré               | Actif en production (nécessite certificats TLS)    |
| Docker               | Opérationnel            | 6 conteneurs orchestrés avec healthchecks          |

---

## Conventions

- **Branches** : `feature/`, `fix/`, `refactor/`, `hotfix/`, `docs/`
- **Commits** : [Conventional Commits](https://www.conventionalcommits.org/) — `feat(scope): description`
- **Versioning** : [Semantic Versioning](https://semver.org/) — `MAJOR.MINOR.PATCH`
- **Nommage** : PascalCase (composants/classes), camelCase (variables/fonctions), UPPER_SNAKE_CASE (constantes)
