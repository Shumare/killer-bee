# Déploiement physique — Killer Bee

Environnement cible : serveur Proxmox avec 4 VMs sur un réseau interne.

---

## Architecture des VMs

```
Internet / Réseau local
        │
        ▼
┌──────────────────┐
│   VM-GATEWAY     │  1 vCPU  512 MB
│   Traefik        │  IP publique (ou réseau LAN)
│   :80 → :443     │  TLS termination
└────────┬─────────┘
         │  réseau interne Proxmox (vmbr1)
    ┌────┴──────────────────────────┐
    │                               │
    ▼                               ▼
┌──────────────┐           ┌──────────────────┐
│  VM-FRONT    │           │   VM-BACK        │
│  nginx       │           │   Node.js :3000  │
│  1 vCPU      │           │   2 vCPU         │
│  512 MB      │           │   1 GB           │
└──────────────┘           └────────┬─────────┘
                                    │
                                    ▼
                           ┌──────────────────┐
                           │   VM-BDD         │
                           │   MySQL :3306    │
                           │   2 vCPU         │
                           │   2 GB           │
                           └──────────────────┘
```

---

## Composants du projet

| Composant | Nature | Rôle |
|---|---|---|
| Traefik | Reverse proxy | Entry point HTTP/HTTPS, TLS, routing |
| Backend | Node.js/Express | API REST, logique métier, JWT |
| Frontend | nginx + fichiers statiques | React buildé, servi par nginx |
| MySQL | SGBD | Persistance des données |
| middleware-local | Librairie npm | Partagée à la compilation uniquement, pas un service |

---

## Ce qui tourne sur chaque VM

### VM-GATEWAY — Traefik

- Déploie le contenu du dossier `gateway/`
- Route `/api/*` → VM-BACK:3000
- Route `/` → VM-FRONT:80
- Gère le TLS (certificat Let's Encrypt ou auto-signé en test)
- Seule VM avec des ports exposés vers l'extérieur (80 et 443)

Configuration à adapter dans `gateway/dynamic/services.yml` :

```yaml
http:
  services:
    backend:
      loadBalancer:
        servers:
          - url: "http://<IP-VM-BACK>:3000"

    frontend:
      loadBalancer:
        servers:
          - url: "http://<IP-VM-FRONT>:80"
```

### VM-FRONT — nginx

- Aucun runtime Node.js nécessaire en production
- Générer le build sur la machine de développement :
  ```bash
  cd frontend
  npm run build
  # produit le dossier frontend/dist/
  ```
- Copier `dist/` sur la VM et configurer nginx pour le servir :
  ```nginx
  server {
      listen 80;
      root /var/www/killer-bee;
      index index.html;
      location / {
          try_files $uri $uri/ /index.html;
      }
  }
  ```
- `VITE_API_URL` doit pointer vers l'URL publique de VM-GATEWAY (pas vers VM-BACK directement)

### VM-BACK — Node.js

- Installer Node.js 20
- Générer le build :
  ```bash
  cd backend
  npm ci
  npm run build
  # produit le dossier backend/dist/
  ```
- Créer un fichier `.env` :
  ```env
  NODE_ENV=production
  PORT=3000
  JWT_SECRET=<secret_fort>
  DB_HOST=<IP-VM-BDD>
  DB_PORT=3306
  DB_NAME=killer_bee
  DB_USER=killer_bee_user
  DB_PASSWORD=<mot_de_passe>
  ```
- Lancer le serveur :
  ```bash
  node dist/index.js
  ```
- En production, utiliser PM2 pour garder le processus actif :
  ```bash
  npm install -g pm2
  pm2 start dist/index.js --name killer-bee-backend
  pm2 save
  pm2 startup
  ```

### VM-BDD — MySQL

- Installer MySQL 8 bare-metal (plus stable pour la persistance que Docker)
- Accessible uniquement depuis VM-BACK (firewall/iptables)
- Initialisation de la base :
  ```sql
  CREATE DATABASE killer_bee CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE USER 'killer_bee_user'@'<IP-VM-BACK>' IDENTIFIED BY '<mot_de_passe>';
  GRANT ALL PRIVILEGES ON killer_bee.* TO 'killer_bee_user'@'<IP-VM-BACK>';
  FLUSH PRIVILEGES;
  ```

---

## Règles réseau

```
Externe    → VM-GATEWAY     ✓ port 80, 443
VM-GATEWAY → VM-FRONT       ✓ port 80
VM-GATEWAY → VM-BACK        ✓ port 3000
VM-BACK    → VM-BDD         ✓ port 3306
VM-BACK    → VM-GATEWAY     ✗
VM-FRONT   → VM-BACK        ✗  (le front ne parle jamais directement au back)
VM-BDD     → tout           ✗  (aucune connexion sortante)
```

Le frontend passe toujours par Traefik pour atteindre l'API. Il ne connaît que l'URL publique de la gateway.

---

## Sizing recommandé (environnement de test)

| VM | OS | vCPU | RAM | Disque |
|---|---|---|---|---|
| VM-GATEWAY | Debian 12 minimal | 1 | 512 MB | 8 GB |
| VM-FRONT | Debian 12 minimal | 1 | 512 MB | 8 GB |
| VM-BACK | Debian 12 minimal | 2 | 1 GB | 16 GB |
| VM-BDD | Debian 12 minimal | 2 | 2 GB | 32 GB |

Debian minimal sans GUI, accès SSH uniquement.
Total : 6 vCPU / 4 GB RAM.

---

## Ordre de déploiement

```
1. Créer les 4 VMs sur Proxmox
   └── Configurer le réseau interne vmbr1 pour les 4 VMs
   └── VM-GATEWAY seule a accès au réseau externe

2. VM-BDD
   └── Installer MySQL 8
   └── Créer la base killer_bee et l'utilisateur

3. VM-BACK
   └── Installer Node.js 20
   └── Déployer le build backend
   └── Configurer .env avec les IPs internes
   └── Lancer avec PM2

4. VM-FRONT
   └── Installer nginx
   └── Déployer le dist/ du frontend
   └── Configurer nginx (try_files pour le SPA React)

5. VM-GATEWAY
   └── Installer Docker
   └── Adapter services.yml avec les IPs des VMs
   └── Lancer : docker compose -f gateway/docker/docker-compose.yml up -d
```

---

## Migration des données (mock → MySQL)

Le backend utilise actuellement des tableaux in-memory dans les repositories.
La migration vers MySQL ne touche que cette couche — controllers, services, DTOs et cipher restent identiques.

Fichiers à migrer :

```
backend/src/repositories/
  ├── FreezebeRepository.ts    mock → requêtes mysql2
  ├── IngredientRepository.ts  mock → requêtes mysql2
  ├── ProcessRepository.ts     mock → requêtes mysql2
  └── UserRepository.ts        mock → requêtes mysql2
```

Dépendance à ajouter dans `backend/package.json` :

```bash
npm install mysql2
```
