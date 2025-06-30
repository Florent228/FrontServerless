# 🚀 CI/CD Setup - GitHub Container Registry

## ⚡ Activation - Étapes selon votre situation

### **Repository personnel**

1. **Settings** > **Actions** > **General**
2. "Workflow permissions" → **"Read and write permissions"**
3. Cochez **"Allow GitHub Actions to create and approve pull requests"**

### **Repository d'organisation** (si erreur de permissions)

#### Option A : Permissions d'organisation
1. **Organisation Settings** > **Actions** > **General**
2. Activez **"Allow all actions and reusable workflows"**
3. **Organisation Settings** > **Packages** 
4. Activez **"Improved container support"**

#### Option B : Token personnel (si Option A impossible)
1. Créez un **Personal Access Token** :
   - GitHub > **Settings** > **Developer settings** > **Personal access tokens** > **Tokens (classic)**
   - **Generate new token (classic)**
   - Permissions : `write:packages`, `read:packages`
2. Ajoutez le secret dans le repository :
   - **Repository Settings** > **Secrets and variables** > **Actions**
   - **New repository secret** : nom `GHCR_TOKEN`, valeur = votre token

### **Push & Test!**
```bash
git add .
git commit -m "feat: activate CI/CD"
git push origin master
```

✅ **L'image sera publiée sur GitHub Container Registry !**

## 📋 Résultat

À chaque push sur `master` :
- 🔨 **Build** automatique de l'image Docker
- 📤 **Publication** sur GitHub Container Registry avec les tags `latest` et `master-SHA`
- 🧹 **Nettoyage** automatique des anciennes images (garde les 5 dernières)
- 📊 **Résumé** visible dans GitHub Actions

## 🎯 Utilisation

### **Pour les développeurs**
```bash
# Utiliser la dernière image publiée
docker pull ghcr.io/votre-username/faas-frontend:latest
docker run -d -p 3000:80 ghcr.io/votre-username/faas-frontend:latest
```

### **Pour la production**
```bash
# Avec le fichier docker-compose alternatif
docker-compose -f docker-compose.prod.yml up -d
```

## 🚨 Problème de permissions ?

**Erreur "installation not allowed to Create organization package" ?**
👉 **[Guide de dépannage détaillé](TROUBLESHOOT-PERMISSIONS.md)**

## 📖 Documentation complète

- **Guide détaillé** : [CI-CD.md](CI-CD.md)
- **Guide Docker** : [DOCKER.md](DOCKER.md)
- **Dépannage permissions** : [TROUBLESHOOT-PERMISSIONS.md](TROUBLESHOOT-PERMISSIONS.md)

## 🛠️ Personalisation

Modifiez `.github/workflows/docker-publish.yml` pour :
- Changer le nom de l'image
- Ajouter d'autres branches
- Modifier la rétention des images

---

🎉 **Votre pipeline CI/CD est maintenant actif !** 