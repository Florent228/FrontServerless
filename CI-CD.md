# 🚀 Guide CI/CD - Déploiement automatique Docker

Ce guide explique comment configurer le déploiement automatique de votre image Docker sur Docker Hub à chaque push sur la branche `master`.

## 📋 Prérequis

- ✅ Compte GitHub avec votre repository
- ✅ Compte Docker Hub ([créer un compte](https://hub.docker.com/))
- ✅ Token d'accès Docker Hub

## 🔧 Configuration initiale

### 1. **Créer un token Docker Hub**

1. Connectez-vous sur [Docker Hub](https://hub.docker.com/)
2. Allez dans **Account Settings** > **Security**
3. Cliquez sur **New Access Token**
4. Nom du token : `github-actions-faas`
5. Permissions : **Read, Write, Delete**
6. **Copiez le token** (vous ne le reverrez plus !)

### 2. **Configurer les secrets GitHub**

1. Allez dans votre repository GitHub
2. **Settings** > **Secrets and variables** > **Actions**
3. Cliquez sur **New repository secret**

Créez ces 2 secrets :

| Secret | Valeur | Description |
|--------|--------|-------------|
| `DOCKER_HUB_USERNAME` | `votre-username-dockerhub` | Votre nom d'utilisateur Docker Hub |
| `DOCKER_HUB_TOKEN` | `dckr_pat_xxxxx...` | Le token créé à l'étape 1 |

### 3. **Vérifier le nom de l'image**

Dans le fichier `.github/workflows/docker-publish.yml`, vérifiez cette ligne :

```yaml
env:
  IMAGE_NAME: faas-frontend  # ⬅️ Changez si nécessaire
```

## 🎯 Fonctionnement du workflow

### **Déclenchement automatique**

Le workflow se déclenche automatiquement lors d'un push sur `master` :

```bash
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin master  # ⬅️ Déclenche le workflow
```

### **Étapes du workflow**

1. 📥 **Checkout** - Récupère le code source
2. 🔧 **Setup Docker** - Configure l'environnement Docker
3. 🔑 **Login** - Se connecte à Docker Hub
4. 🏷️ **Metadata** - Génère les tags automatiquement
5. 🔨 **Build & Push** - Build et publie l'image
6. 🧹 **Cleanup** - Supprime les anciennes images
7. 📊 **Summary** - Affiche un résumé

### **Tags générés automatiquement**

- `latest` - Dernière version stable
- `master-abc1234` - Version basée sur le commit SHA
- `master` - Version de la branche master

## 📦 Utilisation des images publiées

### **Récupérer la dernière image**

```bash
# Récupérer l'image
docker pull votre-username/faas-frontend:latest

# Lancer l'application
docker run -d -p 3000:80 votre-username/faas-frontend:latest
```

### **Mettre à jour docker-compose.yml pour utiliser l'image publiée**

```yaml
services:
  faas-app:
    image: votre-username/faas-frontend:latest  # ⬅️ Remplace le build local
    container_name: faas-app
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

Puis lancez avec :
```bash
docker-compose pull  # Récupère la dernière version
docker-compose up -d faas-app
```

## 🔍 Surveillance et debugging

### **Voir l'état du workflow**

1. Allez dans votre repository GitHub
2. Onglet **Actions**
3. Cliquez sur le dernier workflow
4. Consultez les logs détaillés

### **Vérifier les images sur Docker Hub**

1. Allez sur [Docker Hub](https://hub.docker.com/)
2. **Repositories** > `faas-frontend`
3. Onglet **Tags** pour voir toutes les versions

### **Commandes de debugging**

```bash
# Voir les images locales
docker images | grep faas-frontend

# Tester une image spécifique
docker run --rm -p 3000:80 votre-username/faas-frontend:master-abc1234

# Voir les logs d'un conteneur
docker logs faas-app
```

## 🛠️ Personnalisation du workflow

### **Changer la fréquence de nettoyage**

Dans `.github/workflows/docker-publish.yml`, modifiez cette ligne :

```bash
TAGS_TO_DELETE=$(./regctl tag ls $REPO | grep -E '^master-|^latest$' | sort -r | tail -n +6)
#                                                                                          ⬅️ +6 = garde 5 images
```

### **Ajouter d'autres branches**

```yaml
on:
  push:
    branches: [ master, develop, staging ]  # ⬅️ Ajouter d'autres branches
```

### **Exclure certains fichiers**

```yaml
on:
  push:
    branches: [ master ]
    paths-ignore:
      - '**.md'
      - '.gitignore'
      - 'LICENSE'
      - 'docs/**'      # ⬅️ Ajouter d'autres exclusions
```

## 🚨 Dépannage

### **Erreur : secrets not found**

```
Error: Username and password required
```

**Solution :** Vérifiez que les secrets `DOCKER_HUB_USERNAME` et `DOCKER_HUB_TOKEN` sont correctement configurés.

### **Erreur : permission denied**

```
Error: denied: requested access to the resource is denied
```

**Solutions :**
1. Vérifiez que le token Docker Hub a les permissions **Write**
2. Vérifiez que le nom d'utilisateur est correct
3. Créez le repository sur Docker Hub manuellement

### **Workflow ne se déclenche pas**

**Causes possibles :**
- Push sur une autre branche que `master`
- Modification seulement de fichiers exclus (`.md`, etc.)
- Workflow désactivé dans les paramètres

### **Build échoue**

```
Error: failed to solve: failed to read dockerfile
```

**Solution :** Vérifiez que le `Dockerfile` est présent à la racine du repository.

## 🔐 Sécurité

### **Bonnes pratiques**

- ✅ Utilisez des **tokens d'accès** plutôt que des mots de passe
- ✅ **Limitez les permissions** des tokens (Read, Write, Delete uniquement)
- ✅ **Rotez les tokens** régulièrement
- ✅ **Ne commitez jamais** de secrets dans le code

### **Audit des accès**

1. Docker Hub > **Account Settings** > **Security**
2. Vérifiez la section **Access Tokens**
3. Révoquezles tokens non utilisés

## 📊 Monitoring

### **Métriques utiles**

- 📈 **Fréquence des builds** - Nombre de workflows par semaine
- ⏱️ **Temps de build** - Durée moyenne des workflows
- 💾 **Taille des images** - Évolution de la taille des images
- 🔄 **Succès/Échecs** - Taux de réussite des workflows

### **Notifications**

GitHub peut envoyer des notifications par email en cas d'échec :
1. **Settings** > **Notifications**
2. Activez **Actions** dans **Email notifications**

## 🎉 Résultat final

Après configuration, à chaque push sur `master` :

1. 🔄 **Build automatique** de l'image Docker
2. 📤 **Publication** sur Docker Hub
3. 🧹 **Nettoyage** des anciennes images
4. 📧 **Notification** du résultat

Votre équipe peut alors utiliser :

```bash
docker pull votre-username/faas-frontend:latest
docker run -d -p 3000:80 votre-username/faas-frontend:latest
```

**C'est tout ! Votre CI/CD est opérationnel ! 🚀** 