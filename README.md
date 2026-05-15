# KillerBee

Plateforme de gestion de modèles de produits (glaces) — architecture microservices React + TypeScript + Express + SQL Server + Traefik.

---

## Prérequis

- [Node.js](https://nodejs.org/) >= 18
- [Docker](https://www.docker.com/) + Docker Compose
- (Optionnel) [kubectl](https://kubernetes.io/docs/tasks/tools/) pour le déploiement Kubernetes

---

## Démarrage rapide — Docker Compose

```bash
# 1. Cloner le repo
git clone <url-du-repo>
cd killer-bee

# 2. Copier le fichier d'environnement
cp .env.example .env
# Éditer .env si nécessaire (mots de passe, secrets JWT, etc.)

# 3. Lancer tous les services
make docker-up
# ou : docker compose up -d
```

L'application est disponible sur :

| Service | URL |
|---|---|
| Frontend | http://localhost |
| Traefik Dashboard | http://localhost:8080 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3000 (admin / valeur de GRAFANA_PASSWORD) |

---

## Développement local (sans Docker)

```bash
# 1. Installer les dépendances (tous les workspaces)
npm install

# 2. Démarrer SQL Server séparément (Docker requis)
docker compose up -d sqlserver

# 3. Lancer tous les services en mode watch
make dev
# ou : npm run dev
```

Les services écoutent sur les ports suivants :

| Service | Port |
|---|---|
| auth-service | 3001 |
| model-service | 3002 |
| ingredient-service | 3003 |
| process-service | 3004 |
| test-service | 3005 |
| Frontend (Vite) | 5173 |

---

## Structure du projet

```
killer-bee/
├── apps/
│   ├── frontend/               # React + TypeScript + Vite
│   └── services/
│       ├── auth-service/       # Authentification JWT (port 3001)
│       ├── model-service/      # Modèles + ingrédients + propriétés (port 3002)
│       ├── ingredient-service/ # Ingrédients (port 3003)
│       ├── process-service/    # Procédés + étapes (port 3004)
│       └── test-service/       # Tests qualité (port 3005)
├── packages/
│   ├── crypto/                 # Algorithme de chiffrement maison (@killerbee/crypto)
│   └── shared/                 # Types et DTOs partagés (@killerbee/shared)
├── infra/
│   ├── traefik/                # Config API Gateway (TLS, JWT, rate-limit)
│   ├── k8s/                    # Manifests Kubernetes
│   └── monitoring/             # Prometheus + Grafana
├── docker-compose.yml
└── Makefile
```

---

## Commandes utiles

```bash
make build          # Compiler tous les services TypeScript
make test           # Lancer tous les tests Jest
make lint           # ESLint sur tout le projet
make format         # Prettier sur tout le projet
make docker-build   # Rebuilder les images Docker
make docker-down    # Arrêter tous les conteneurs
make docker-logs    # Suivre les logs en temps réel
make migrate        # Exécuter les migrations SQL Server
```

---

## Migrations base de données

Les migrations sont gérées par TypeORM CLI depuis `model-service` :

```bash
# Appliquer les migrations
make migrate

# Annuler la dernière migration
make migrate-revert
```

---

## Variables d'environnement

Copier `.env.example` en `.env` et adapter les valeurs :

| Variable | Description | Défaut |
|---|---|---|
| `DB_PASSWORD` | Mot de passe SQL Server | `KillerBee@2024!` |
| `JWT_SECRET` | Secret de signature des access tokens | à changer en prod |
| `JWT_REFRESH_SECRET` | Secret des refresh tokens | à changer en prod |
| `CRYPTO_KEY_SUB1` | Décalage César (entier) | `3` |
| `CRYPTO_KEY_SUB2` | Clé Vigenère (string) | `KILLERBEE` |
| `CRYPTO_KEY_TRANSPOSITION` | Clé de transposition colonnes | `SECRET` |
| `GRAFANA_PASSWORD` | Mot de passe admin Grafana | `admin` |

---

## Déploiement Kubernetes

```bash
# Appliquer tous les manifests
kubectl apply -f infra/k8s/namespace.yml
kubectl apply -f infra/k8s/secrets.yml       # Mettre à jour les secrets avant !
kubectl apply -f infra/k8s/sqlserver.yml
kubectl apply -f infra/k8s/services.yml
kubectl apply -f infra/k8s/traefik.yml
```

> **Important** : éditer `infra/k8s/secrets.yml` avec des vraies valeurs base64 avant de déployer en production.

---

## Architecture de sécurité (Zero Trust)

- Toutes les routes (sauf `/auth/login` et `/auth/register`) requièrent un JWT valide
- Le JWT est vérifié deux fois : par Traefik (ForwardAuth) **et** par chaque microservice
- Les propriétés dynamiques des modèles sont stockées chiffrées en base (César + Vigenère + Transposition)
- Les secrets sont injectés via variables d'environnement / Kubernetes Secrets (jamais en dur)
- Audit logs JSON structurés sur chaque requête (Winston)
