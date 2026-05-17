# killer-bee

Application web full-stack organisée en 3 couches indépendantes : **frontend**, **backend** et **gateway**. Chaque couche a une responsabilité unique et communique via des interfaces contractuelles claires.

---

## Architecture globale

```
┌─────────────────────────────────────────────────────────────────┐
│                          UTILISATEUR                            │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTP (dev) / HTTPS (prod)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               FRONTEND nginx:80  (Docker : killer-bee-frontend) │
│                                                                 │
│   /*          → fichiers statiques React                        │
│   /api/*      → proxy → backend:3000                           │
└──────────────────────────────┬──────────────────────────────────┘
                               │ /api/*
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│               BACKEND Express:3000  (Docker : killer-bee-backend)│
│                                                                 │
│  /api/auth/*       /api/users/*      /api/freezbe/*             │
│  /api/ingredients/*                 /api/processes/*            │
└─────────────────────────────────────────────────────────────────┘
```

> **Traefik** (optionnel) : disponible dans `gateway/docker/docker-compose.yml` pour un déploiement production avec HTTPS. En dev local Docker, c'est nginx qui fait le routage.

---

## Structure du projet

```
killer-bee/
├── frontend/              # Application React / TypeScript
├── backend/               # API REST Node / TypeScript
├── gateway/               # Configuration Traefik (production)
├── middleware-local/      # Middlewares locaux (hors Docker)
├── docker-compose.yml     # Orchestration locale (backend + frontend)
└── .env.example           # Variables d'environnement à configurer
```

---

## Frontend

### Rôle
Interface utilisateur React avec TypeScript. Communique avec le backend uniquement via la couche `api/`. Ne connaît pas l'organisation interne du backend.

### Structure

```
frontend/src/
├── ui/
│   ├── pages/         # Pages complètes
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx    # Shell principal avec navigation
│   │   ├── FreezebePage.tsx     # CRUD modèles Freezbe
│   │   ├── IngredientPage.tsx   # CRUD ingrédients
│   │   ├── ProcessPage.tsx      # CRUD procédés de fabrication
│   │   └── ProfilePage.tsx
│   ├── components/    # Composants réutilisables (Button, Input, LoginForm, Navbar)
│   └── widgets/       # Assemblages (AuthLayout, DashboardHeader, Sidebar)
│
├── api/               # Appels réseau centralisés
│   ├── client.ts          # Client HTTP fetch natif
│   ├── auth.api.ts        # login(), logout()
│   ├── user.api.ts        # getUser(), updateProfile()
│   ├── freezbe.api.ts     # getAllFreezebes(), createFreezebe(), …
│   ├── ingredient.api.ts  # getAllIngredients(), createIngredient(), …
│   └── process.api.ts     # getAllProcesses(), createProcess(), …
│
├── dto/               # Types des données reçues du backend
│   ├── auth.dto.ts
│   ├── user.dto.ts
│   ├── freezbe.dto.ts
│   ├── ingredient.dto.ts
│   └── process.dto.ts
│
├── models/            # Types métier frontend (User, Session)
├── mappers/           # Transformation DTO → Model
├── schemas/           # Validation optionnelle des données reçues
├── hooks/             # Logique React
│   ├── useLogin.ts
│   ├── useLogout.ts
│   ├── useUser.ts
│   ├── useFreezebes.ts
│   ├── useIngredients.ts
│   └── useProcesses.ts
├── store/             # État global React Context
│   ├── auth.store.ts      # Utilisateur connecté + session
│   ├── app.store.ts       # État global de l'app
│   └── router.store.ts    # Navigation entre pages
├── security/          # Guards d'accès frontend
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
api/auth.api.ts  ──────────────────►  nginx  ──►  Backend
                                          │
                 ◄────────────────────────┘
    │  reçoit LoginResponseDTO
    ▼
mappers/auth.mapper.ts   (DTO → User + Session)
    │
    ▼
store/auth.store.ts      (stockage état global)
    │
    ▼
ui/                      (re-render → DashboardPage)
```

---

## Backend

### Rôle
API REST Node/TypeScript. Contient la logique métier, la validation des données entrantes et l'accès aux données. Les données sont actuellement servies depuis une couche mock en mémoire.

### Structure

```
backend/src/
├── routes/            # Déclaration des endpoints Express
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   ├── freezbe.routes.ts
│   ├── ingredient.routes.ts
│   └── process.routes.ts
│
├── controllers/       # Lecture body HTTP → appel service → réponse
│   ├── AuthController.ts
│   ├── FreezebeController.ts
│   ├── IngredientController.ts
│   └── ProcessController.ts
│
├── services/          # Logique métier — règles, orchestration
│   ├── AuthService.ts
│   ├── FreezebeService.ts
│   ├── IngredientService.ts
│   └── ProcessService.ts
│
├── repositories/      # Accès données (appelle mock-data/)
│   ├── UserRepository.ts
│   ├── SessionRepository.ts
│   ├── FreezebeRepository.ts
│   ├── IngredientRepository.ts
│   └── ProcessRepository.ts
│
├── mock-data/         # Données en mémoire (remplace la DB)
│   ├── user.mock.ts
│   ├── freezbe.mock.ts
│   ├── ingredient.mock.ts
│   └── process.mock.ts
│
├── dto/               # Formats d'échange API
├── models/            # Objets métier internes
├── mappers/           # Transformations Record → Model → DTO
├── middlewares/       # auth.middleware, error.middleware
├── domain/            # Définitions de domaine métier
├── security/
│   ├── crypto/        # Chiffrement symétrique personnalisé
│   └── audit/         # Journalisation des événements de sécurité
├── config/            # env.ts, server.ts, jwt.ts
└── utils/             # asyncHandler, logger
```

### Flux d'une requête backend

```
POST /api/auth/login
    │
    ▼
routes/auth.routes.ts  (asyncHandler)
    │
    ▼
controllers/AuthController.ts
    │
    ▼
services/AuthService.ts  (audit log login_attempt)
    │
    ▼
repositories/UserRepository.ts
    │
    ▼
mock-data/user.mock.ts   (tableau en mémoire)
    │  retourne UserRecord
    ▼
mappers/auth.mapper.ts   (Record → LoginResponseDTO)
    │
    ▼
{ access_token, user_id, full_name }
```

---

## Gateway

### Rôle
Reverse proxy Traefik. Prévu pour le déploiement production avec HTTPS et Zero Trust. **Non actif en dev local Docker** — c'est nginx qui assure le routage dans ce cas.

### Structure

```
gateway/
├── traefik/
│   └── traefik.yml        # Configuration principale (entrypoints, providers, logs)
├── dynamic/
│   ├── routers.yml        # Règles de routage URL → service
│   ├── services.yml       # Déclaration des services (adresses internes)
│   └── middlewares.yml    # rate-limit, secure-headers, auth-check, compress
├── certificates/          # Certificats SSL/TLS (non versionnés)
├── logs/                  # Journaux HTTP et erreurs
├── docker/
│   └── docker-compose.yml # Orchestration production avec Traefik
└── utils/
    └── rotateLogs.sh      # Rotation des fichiers de log
```

### Règles de routage (production)

| Préfixe URL  | Service cible  | Middlewares appliqués          |
|--------------|----------------|-------------------------------|
| `/api/*`     | backend:3000   | `rate-limit`, `secure-headers` |
| `/*`         | frontend:80    | `secure-headers`, `compress`   |

### Middlewares

| Middleware       | Rôle                                             |
|------------------|--------------------------------------------------|
| `secure-headers` | Protection XSS, clickjacking, content-type sniff |
| `rate-limit`     | 100 req/s moy., burst 50                         |
| `auth-check`     | Vérification JWT via backend (non actif en dev)  |
| `compress`       | Compression des réponses                         |

---

## Docker

### Conteneurs

| Conteneur              | Image de base   | Rôle                                      |
|------------------------|-----------------|-------------------------------------------|
| `killer-bee-frontend`  | nginx:alpine    | Sert le SPA React + proxyfie `/api` vers le backend |
| `killer-bee-backend`   | node:20-alpine  | API Express compilée (TypeScript → JS)    |

### Lancer en local

```bash
# 1. Configurer les variables d'environnement
cp .env.example .env

# 2. Construire les images et démarrer
docker-compose up --build

# L'application est disponible sur http://localhost
```

### Reconstruction après modification

```bash
# Reconstruire un seul service
docker-compose up --build backend
docker-compose up --build frontend

# Arrêter et supprimer les conteneurs
docker-compose down
```

### Architecture des images

**Backend** (`backend/Dockerfile`) — build multi-stage :
```
node:20-alpine (builder)
  ├── npm ci              # installe toutes les dépendances
  └── npm run build       # compile TypeScript → dist/

node:20-alpine (final)
  ├── npm ci --omit=dev   # uniquement les dépendances de production
  └── dist/               # code compilé copié depuis builder
```

**Frontend** (`frontend/Dockerfile`) — build multi-stage :
```
node:20-alpine (builder)
  ├── npm ci              # installe toutes les dépendances
  └── npm run build       # compile React → dist/ (fichiers statiques)

nginx:alpine (final)
  ├── dist/               # fichiers statiques copiés depuis builder
  └── nginx.conf          # routing : /* → statiques, /api/* → backend:3000
```

### Réseau interne

```
┌─────────────────────────────────────────┐
│         Réseau Docker "app"             │
│                                         │
│  killer-bee-frontend:80  ──/api/*──►   │
│  killer-bee-backend:3000               │
│                                         │
└──────────────┬──────────────────────────┘
               │ port 80
               ▼
          http://localhost
```

Le backend n'est **pas exposé** sur l'hôte — seul le frontend (port 80) est accessible depuis le navigateur.

### Données

Les données (ingrédients, modèles Freezbe, procédés) sont stockées **en mémoire** dans le conteneur backend. Elles sont perdues à chaque `docker-compose down`. Pour persister les données, une base de données (PostgreSQL, SQLite) avec un volume Docker sera nécessaire.

### Déploiement production (avec Traefik)

```bash
cd gateway/docker
cp .env.example .env   # renseigner JWT_SECRET
docker-compose up --build
```

Traefik prend en charge le port 80 et 443. Des certificats TLS doivent être placés dans `gateway/certificates/`.

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
    │  3. POST /api/auth/login
    ▼
[nginx]  ──  proxy /api/*  ──►  [backend:3000]
                                      │
                                      │  4. routes → controller
                                      │  5. service (audit log)
                                      │  6. repository → mock-data
                                      │  7. mapper Record → DTO
                                      ▼
                               { access_token, user_id, full_name }
                                      │
[auth.mapper.ts]  ◄── réponse ────────┘
    │
    │  8. DTO → User + Session
    ▼
[auth.store.ts]
    │
    │  9. stockage état global
    ▼
[DashboardPage]   10. re-render → interface connectée
```

---

## État actuel

| Couche          | État                       | Notes                                             |
|-----------------|----------------------------|---------------------------------------------------|
| Frontend        | Fonctionnel                | Pages Freezbe, Ingrédients, Procédés avec CRUD    |
| Backend         | Fonctionnel                | Données mock en mémoire (pas de DB)               |
| Gateway Traefik | Configuré, non actif       | Prévu pour la production, nécessite des certificats |
| Base de données | Non implémentée            | Repositories prêts à brancher sur une vraie DB    |
| Docker          | Opérationnel               | 2 conteneurs : backend + frontend via nginx       |

---

## Conventions

- **Branches** : `feature/`, `fix/`, `refactor/`, `hotfix/`, `docs/`
- **Commits** : [Conventional Commits](https://www.conventionalcommits.org/) — `feat(scope): description`
- **Versioning** : [Semantic Versioning](https://semver.org/) — `MAJOR.MINOR.PATCH`
- **Nommage** : PascalCase (composants), camelCase (variables/utils), UPPER_SNAKE_CASE (constantes globales)
