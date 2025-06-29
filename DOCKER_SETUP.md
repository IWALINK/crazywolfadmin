# Configuration Docker

Ce projet utilise Docker pour le développement et la production.

## Fichiers Docker

- `docker-compose.yml` - Configuration de développement
- `docker-compose.dev.yml` - Configuration alternative pour le développement
- `docker-compose.prod.yml` - Configuration pour la production
- `Dockerfile` - Image Docker de l'application

## Développement local

### Option 1 : Docker Compose standard
```bash
# Démarrer l'application
docker-compose up

# Démarrer en arrière-plan
docker-compose up -d

# Arrêter
docker-compose down
```

### Option 2 : Docker Compose dev
```bash
# Démarrer avec la configuration dev
docker-compose -f docker-compose.dev.yml up
```

## Production

### 1. Créer le fichier .env
Copiez `.env.example` vers `.env` et configurez vos variables :

```bash
cp .env.example .env
```

### 2. Configurer les variables d'environnement
Éditez le fichier `.env` avec vos vraies valeurs :

```env
NEXT_PUBLIC_API_URL=https://votre-api.com
DATABASE_URL=mysql://user:password@host:3306/database
JWT_SECRET=votre-cle-secrete-tres-longue
CLOUDINARY_CLOUD_NAME=votre-cloud-name
CLOUDINARY_API_KEY=votre-api-key
CLOUDINARY_API_SECRET=votre-api-secret
```

### 3. Démarrer en production
```bash
# Utiliser la configuration de production
docker-compose -f docker-compose.prod.yml up -d

# Voir les logs
docker-compose -f docker-compose.prod.yml logs -f

# Arrêter
docker-compose -f docker-compose.prod.yml down
```

## Variables d'environnement

### Développement
- `NODE_ENV=development`
- `NEXT_PUBLIC_API_URL=http://localhost:8000`

### Production
- `NODE_ENV=production`
- `NEXT_PUBLIC_API_URL=https://votre-api.com`
- `DATABASE_URL` - URL de connexion à la base de données
- `JWT_SECRET` - Clé secrète pour les tokens JWT
- `CLOUDINARY_*` - Configuration Cloudinary pour les uploads d'images

## Sécurité

⚠️ **Important** : Ne jamais commiter les fichiers `.env` contenant des vraies valeurs !

- ✅ `.env.example` - Peut être commité (valeurs d'exemple)
- ❌ `.env` - Ne doit JAMAIS être commité (vraies valeurs)
- ❌ `.env.local` - Ne doit JAMAIS être commité
- ❌ `.env.production` - Ne doit JAMAIS être commité

## Ports utilisés

- `3000` - Application Next.js
- `80` - Nginx HTTP
- `443` - Nginx HTTPS

## Volumes

- `.` → `/app` - Code source
- `/app/node_modules` - Node modules (volume nommé)
- `./docker/nginx/public.conf` → `/etc/nginx/conf.d/default.conf` - Configuration Nginx
- `./docker/nginx/ssl` → `/etc/nginx/ssl` - Certificats SSL 