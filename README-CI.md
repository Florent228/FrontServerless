# 🚀 CI/CD Setup - GitHub Container Registry

## ⚡ Activation en 2 étapes

### 1. **Activer GitHub Container Registry**
- Allez dans votre repository GitHub
- **Settings** > **Actions** > **General**
- Dans "Workflow permissions", sélectionnez **"Read and write permissions"**
- Cochez **"Allow GitHub Actions to create and approve pull requests"**

### 2. **Push & Enjoy!**
```bash
git add .
git commit -m "feat: activate CI/CD"
git push origin master
```

✅ **C'est tout !** Votre image sera automatiquement publiée sur GitHub Container Registry.

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

## 📖 Documentation complète

- **Guide détaillé** : [CI-CD.md](CI-CD.md)
- **Guide Docker** : [DOCKER.md](DOCKER.md)

## 🛠️ Personalisation

Modifiez `.github/workflows/docker-publish.yml` pour :
- Changer le nom de l'image
- Ajouter d'autres branches
- Modifier la rétention des images

---

🎉 **Votre pipeline CI/CD est maintenant actif !** 