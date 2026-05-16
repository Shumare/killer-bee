# killer-bee

Application web full-stack organisée en 3 couches indépendantes : **frontend**, **backend** et **gateway**. Chaque couche a une responsabilité unique et communique via des interfaces contractuelles claires.

---

## Architecture globale

```
┌─────────────────────────────────────────────────────────────────┐
│                          UTILISATEUR                            │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     GATEWAY (Traefik)                           │
│                                                                 │
│  ┌─────────────┐  ┌─────────────────┐  ┌──────────────────┐   │
│  │  Routage    │  │   Middlewares   │  │  Load Balancer   │   │
│  │             │  │                 │  │                  │   │
│  │ /api/auth/* │  │ • rate-limit    │  │ auth-1           │   │
│  │ /api/users/*│  │ • secure-headers│  │ auth-2           │   │
│  │ /api/prod/* │  │ • auth-check    │  │ auth-3           │   │
│  └─────────────┘  └─────────────────┘  └──────────────────┘   │
└──────────────┬────────────────────────────────────┬────────────┘
               │                                    │
               ▼                                    ▼
┌──────────────────────────┐          ┌─────────────────────────┐
│    FRONTEND (React/TS)   │          │    BACKEND (Node/TS)    │
│                          │          │                         │
│  ui/pages                │          │  routes                 │
│    └─ ui/components      │          │    └─ controllers       │
│         └─ ui/widgets    │          │         └─ services     │
│                          │          │              └─ repos   │
│  hooks (logique React)   │          │                  └─ DB  │
│  api (appels réseau)     │          │                         │
│  dto → mapper → model    │          │  entity → mapper        │
│  store (état global)     │          │    → model → DTO        │
└──────────────────────────┘          └─────────────────────────┘
```

---

## Structure du projet

```
killer-bee/
├── frontend/          # Application React / TypeScript
├── backend/           # API REST Node / TypeScript
└── gateway/           # Reverse proxy Traefik
```

---

## Frontend

### Rôle
Interface utilisateur React avec TypeScript. Le frontend ne connaît pas l'organisation interne du backend — il communique uniquement via la gateway.

### Structure

```
frontend/src/
├── ui/
│   ├── pages/         # Pages complètes (LoginPage, DashboardPage, ProfilePage)
│   ├── components/    # Composants réutilisables (Button, Input, Navbar, LoginForm)
│   └── widgets/       # Assemblages de composants (AuthLayout, DashboardHeader, Sidebar)
│
├── api/               # Appels réseau centralisés
│   ├── client.ts      # Client HTTP (fetch natif)
│   ├── auth.api.ts    # login(), logout()
│   └── user.api.ts    # getUser(), updateProfile()
│
├── dto/               # Types des données reçues du backend (structure backend brute)
├── schemas/           # Validation optionnelle des données reçues
├── models/            # Types métier frontend (User, Session)
├── mappers/           # Transformation DTO → Model
├── hooks/             # Logique React (useLogin, useLogout, useUser)
├── store/             # État global React Context (auth.store, app.store)
└── utils/             # Fonctions pures (formatDate, generateSlug)
```

### Flux d'une donnée frontend

```
Utilisateur (clic)
    │
    ▼
ui/components/LoginForm.tsx
    │  appelle
    ▼
hooks/useLogin.ts
    │  appelle
    ▼
api/auth.api.ts  ──────────────────►  Gateway  ──►  Backend
                                          │
                 ◄────────────────────────┘
    │  reçoit LoginResponseDTO
    ▼
schemas/auth.schema.ts   (validation optionnelle)
    │
    ▼
mappers/auth.mapper.ts   (DTO → User + Session)
    │
    ▼
store/auth.store.ts      (stockage état global)
    │
    ▼
ui/                      (re-render interface)
```

---

## Backend

### Rôle
API REST Node/TypeScript. Contient la logique métier, la validation des données entrantes et l'accès aux données. Ne parle pas directement au frontend.

### Structure

```
backend/src/
├── routes/            # Déclaration des endpoints (auth.routes, user.routes, product.routes)
├── controllers/       # Point d'entrée HTTP — lit le body, appelle le service, retourne la réponse
├── services/          # Logique métier — règles, orchestration, appels repositories
├── repositories/      # Accès DB — SELECT, INSERT, UPDATE, DELETE (à implémenter)
├── interfaces/        # Contrats TypeScript (IUserRepository, IAuthService)
├── dto/               # Formats d'échange API (LoginRequestDTO, LoginResponseDTO)
├── models/            # Objets métier internes (User, Session)
├── entities/          # Représentation base de données (UserEntity, SessionEntity)
├── mappers/           # Transformations Entity → Model → DTO
├── middlewares/       # Traitements transverses (auth.middleware, error.middleware)
├── validators/        # Validation des données entrantes (auth.validator, user.validator)
├── config/            # Configuration globale (env.ts, server.ts, jwt.ts)
├── database/
│   ├── connection.ts  # Connexion DB (à implémenter)
│   ├── migrations/    # Migrations de schéma
│   └── seeders/       # Données initiales
└── utils/             # Fonctions utilitaires (hashPassword, generateToken, formatDate)
```

### Flux d'une requête backend

```
POST /api/auth/login  (depuis gateway)
    │
    ▼
routes/auth.routes.ts
    │  redirige vers
    ▼
controllers/AuthController.ts
    │  extrait body, appelle validator
    ▼
validators/auth.validator.ts
    │  body valide
    ▼
services/AuthService.ts
    │  vérifie utilisateur, compare mdp, génère token
    ▼
repositories/UserRepository.ts
    │  SELECT * FROM users WHERE email = ?
    ▼
[Base de données]
    │  retourne UserEntity
    ▼
mappers/auth.mapper.ts   (Entity → LoginResponseDTO)
    │
    ▼
controllers/AuthController.ts
    │  retourne
    ▼
{ access_token, user_id, full_name }
```

---

## Gateway

### Rôle
Reverse proxy Traefik. Point d'entrée unique de toute communication réseau. Le frontend et les clients externes ne communiquent **jamais** directement avec les microservices.

### Structure

```
gateway/
├── traefik/
│   └── traefik.yml        # Configuration principale (entrypoints, providers, logs, dashboard)
├── dynamic/
│   ├── routers.yml        # Règles de routage URL → service
│   ├── services.yml       # Déclaration des services backend (adresses)
│   └── middlewares.yml    # Middlewares (rate-limit, secure-headers, auth-check, compress)
├── certificates/          # Certificats SSL/TLS
├── logs/                  # Journaux HTTP et erreurs
├── monitoring/            # Métriques temps réel
├── docker/
│   └── docker-compose.yml # Orchestration complète de tous les services
└── utils/
    └── rotateLogs.sh      # Rotation des fichiers de log
```

### Règles de routage actuelles

| Préfixe URL       | Service cible    | Middlewares appliqués             |
|-------------------|------------------|-----------------------------------|
| `/api/auth/*`     | auth-service:3001 | `rate-limit`, `secure-headers`   |
| `/api/users/*`    | user-service:3002 | `auth-check`, `secure-headers`   |
| `/api/products/*` | product-service:3003 | `auth-check`, `secure-headers` |
| `/`               | frontend          | Traefik par label Docker         |

### Middlewares actifs

| Middleware       | Rôle                                              |
|------------------|---------------------------------------------------|
| `secure-headers` | Protection XSS, clickjacking, content-type sniff  |
| `rate-limit`     | 100 req/s moy., burst 50 — anti-abus             |
| `auth-check`     | Vérification JWT via auth-service                 |
| `compress`       | Compression des réponses                          |

---

## Flux complet — Connexion utilisateur

```
[Navigateur]
    │
    │  1. Clic "Se connecter"
    ▼
[LoginForm.tsx]
    │
    │  2. handleSubmit() → useLogin()
    ▼
[useLogin.ts]
    │
    │  3. login({ email, password })
    ▼
[auth.api.ts]  ──  POST /api/auth/login  ──►  [Gateway Traefik]
                                                    │
                                                    │  4. Routage /api/auth/*
                                                    │  5. Middleware rate-limit
                                                    ▼
                                              [auth-service:3001]
                                                    │
                                                    │  6. routes → controller
                                                    │  7. validator
                                                    │  8. service (vérif. mdp, token)
                                                    │  9. repository → DB
                                                    │  10. mapper Entity → DTO
                                                    ▼
                                              { access_token, user_id, full_name }
                                                    │
[auth.api.ts]  ◄── réponse ─────────────────────────┘
    │
    │  11. schema validation (optionnel)
    ▼
[auth.mapper.ts]
    │
    │  12. DTO → User + Session
    ▼
[auth.store.ts]
    │
    │  13. stockage état global
    ▼
[UI]           14. re-render → dashboard
```

---

## État actuel

| Couche     | État                          | Notes                                      |
|------------|-------------------------------|--------------------------------------------|
| Frontend   | Structure complète            | Composants et hooks à brancher sur le store|
| Backend    | Structure complète            | Repositories en attente de connexion DB    |
| Gateway    | Configuration Traefik prête   | À déployer via docker-compose              |
| Base de données | Non implémentée          | Connection.ts et repositories sont des stubs|

---

## Conventions

Ce projet suit les conventions définies dans la documentation de bonnes pratiques :

- **Branches** : `feature/`, `fix/`, `refactor/`, `hotfix/`, `docs/`
- **Commits** : [Conventional Commits](https://www.conventionalcommits.org/) — `feat(scope): description`
- **Versioning** : [Semantic Versioning](https://semver.org/) — `MAJOR.MINOR.PATCH`
- **Nommage** : PascalCase (composants), camelCase (variables/utils), UPPER_SNAKE_CASE (constantes globales)
