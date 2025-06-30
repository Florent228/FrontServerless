# 🐳 Guide Docker - FAAS Frontend

Ce guide explique comment utiliser Docker pour déployer l'application FAAS Frontend.

## 📋 Prérequis

- Docker Engine >= 20.10
- Docker Compose >= 2.0

## 🏗️ Architecture Docker

L'application utilise une approche **multi-stage** optimisée pour la production :

### 🚀 Application de production
- **Base** : Nginx Alpine (optimisé)
- **Port** : 3000
- **Features** : Fichiers statiques optimisés, compression gzip, cache headers, health checks
- **Size** : ~25MB (sans dépendances de développement)

## 🚀 Démarrage rapide

```bash
# Build l'image
docker-compose build faas-app

# Lance l'application
docker-compose up -d faas-app

# Build et lancement en une commande
docker-compose up --build -d faas-app
```

L'application sera accessible sur **http://localhost:3000**

## 🛠️ Commandes utiles

```bash
# Build de l'image
docker-compose build faas-app

# Lancement en arrière-plan
docker-compose up -d faas-app

# Build + Lancement en une commande
docker-compose up --build -d faas-app

# Redémarrage de l'application
docker-compose restart faas-app

# Logs en temps réel
docker-compose logs -f faas-app

# Statut du conteneur
docker-compose ps

# Ouvrir un shell dans le conteneur
docker-compose exec faas-app sh

# Arrêt de l'application
docker-compose down

# Nettoyage complet
docker-compose down --rmi all --volumes
```

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```bash
# API Configuration (build time)
VITE_API_URL=http://localhost:3000

# Docker Configuration
COMPOSE_PROJECT_NAME=faas
DOCKER_BUILDKIT=1
```

### Personnalisation du port

Modifiez `docker-compose.yml` pour changer le port :

```yaml
services:
  faas-app:
    ports:
      - "3000:80"  # Changez le port ici (HOST:CONTAINER)
```

> **Note** : L'attribut `version` a été supprimé du fichier Docker Compose car il est maintenant obsolète dans les versions récentes de Docker Compose (>= v2.0).

## 🐛 Dépannage

### Problèmes courants

#### Port déjà utilisé
```bash
# Vérifiez les ports occupés
netstat -tulpn | grep :3000
# Windows : netstat -an | findstr :3000

# Changez le port dans docker-compose.yml
```

#### Cache de build
```bash
# Rebuild sans cache
docker-compose build --no-cache faas-app

# Nettoyage + rebuild
docker-compose down --rmi all && docker-compose build faas-app
```

#### Permissions sur Linux
```bash
# Ajustez les permissions
sudo chown -R $USER:$USER .
```

### Logs de débogage

```bash
# Logs détaillés de l'application
docker-compose logs -f faas-app

# Logs avec timestamps
docker-compose logs -f -t faas-app

# Logs des 100 dernières lignes
docker-compose logs --tail=100 faas-app
```

## 📊 Monitoring et santé

### Health checks

Le conteneur inclut un health check automatique :

```bash
# Vérification manuelle
docker-compose exec faas-app curl -f http://localhost/

# Statut des health checks
docker-compose ps
```

### Métriques

```bash
# Utilisation des ressources
docker stats faas-app

# Informations détaillées
docker-compose exec faas-app top
```

## 🚢 Déploiement

### Build pour la production

```bash
# Build optimisé avec Docker
docker build -t faas-frontend:latest .

# Ou via Docker Compose
docker-compose build faas-app
```

### Registry Docker

```bash
# Tag pour le registry
docker tag faas-frontend:latest registry.example.com/faas-frontend:v1.0.0

# Push vers le registry
docker push registry.example.com/faas-frontend:v1.0.0
```

## 🔒 Sécurité

### Bonnes pratiques implémentées

- ✅ Image Alpine (surface d'attaque réduite)
- ✅ Utilisateur non-root
- ✅ Security headers HTTP
- ✅ Multi-stage build (pas de code source en production)
- ✅ .dockerignore complet
- ✅ Health checks configurés

### Scan de sécurité

```bash
# Scan de l'image avec Docker Scout
docker scout cves faas-frontend:latest

# Scan avec Trivy
trivy image faas-frontend:latest
```

## 📈 Optimisations

### Taille de l'image

- **Image finale** : ~25MB (Nginx + assets statiques uniquement)
- **Image de build** : ~800MB (temporaire, supprimée automatiquement)

### Cache des layers

Les fichiers de configuration sont copiés avant le code source pour optimiser le cache Docker :

```dockerfile
COPY package*.json ./     # Layer mis en cache
COPY tsconfig*.json ./    # Layer mis en cache
# ...
COPY src/ ./src/         # Layer invalidé seulement si le code change
```

## 🤝 Contribution

### Développement

1. Forkez le projet
2. Créez une branche : `git checkout -b feature/ma-feature`
3. Modifiez le code source
4. Testez avec : `docker-compose up --build -d faas-app`
5. Vérifiez que l'application fonctionne sur http://localhost:3000
6. Committez et poussez
7. Créez une Pull Request

### Tests

```bash
# Build et test de l'application
docker-compose up --build -d faas-app

# Vérifier le fonctionnement
curl http://localhost:3000

# Tests manuels dans le navigateur
# Ouvrez http://localhost:3000 dans votre navigateur
```

## 🚀 CI/CD - Déploiement automatique

Le projet inclut un workflow GitHub Actions qui publie automatiquement l'image Docker sur **GitHub Container Registry** à chaque push sur `master`.

### **Configuration rapide**

1. Activez les permissions d'écriture dans **Settings** > **Actions** > **General**
2. Push sur master → Image automatiquement publiée ! 

### **Utiliser l'image publiée**

Au lieu de builder localement, vous pouvez utiliser l'image publiée :

```yaml
# docker-compose.yml
services:
  faas-app:
    image: ghcr.io/votre-username/faas-frontend:latest  # ⬅️ Au lieu de build: .
    container_name: faas-app
    ports:
      - "3000:80"
    # ... reste de la configuration
```

📖 **Guide complet** : [CI-CD.md](CI-CD.md)

---

💡 **Conseil** : Sauvegardez les commandes Docker Compose fréquemment utilisées dans un fichier texte !

🐛 **Problème** ? Consultez la section [Dépannage](#🐛-dépannage) ou ouvrez une issue. 