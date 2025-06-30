# 🔧 Dépannage - Erreurs de permissions GitHub Container Registry

## 🚨 Erreur : "installation not allowed to Create organization package"

Cette erreur survient quand GitHub Actions n'a pas les permissions pour créer des packages dans une organisation.

### 📋 **Diagnostic rapide**

Vérifiez votre URL repository :
- `github.com/USERNAME/repo` → Repository personnel
- `github.com/ORGANISATION/repo` → Repository d'organisation ⚠️

### 🛠️ **Solutions par ordre de priorité**

---

#### **Solution 1 : Permissions d'organisation (Recommandée)**

**Si vous êtes admin de l'organisation :**

1. **Organisation Settings** (pas repository settings !)
   ```
   https://github.com/organisations/florent228/settings
   ```

2. **Actions** → **General**
   - "Allow all actions and reusable workflows" ✅

3. **Packages**
   - "Improved container support" ✅
   - "Package creation" → **"Public"** ou **"Private"**

4. **Member privileges**
   - "Repository creation" → Permettre les packages

---

#### **Solution 2 : Token personnel (Si Solution 1 impossible)**

**Créer un Personal Access Token :**

1. **Votre profil GitHub** → **Settings**
   ```
   https://github.com/settings/tokens
   ```

2. **Developer settings** → **Personal access tokens** → **Tokens (classic)**

3. **Generate new token (classic)**
   - Nom : `GitHub Container Registry`
   - Expiration : `90 days` (ou plus)
   - Permissions nécessaires :
     - ✅ `write:packages`
     - ✅ `read:packages`
     - ✅ `delete:packages` (optionnel)

4. **Copier le token** (vous ne le reverrez plus !)

**Ajouter le token au repository :**

1. **Repository Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**
   - Name : `GHCR_TOKEN`
   - Secret : `ghp_xxxxxxxxxxxx` (votre token)

---

#### **Solution 3 : Permissions repository**

**Dans votre repository :**

1. **Settings** → **Actions** → **General**

2. **Workflow permissions**
   - ✅ "Read and write permissions"
   - ✅ "Allow GitHub Actions to create and approve pull requests"

---

#### **Solution 4 : Forcer les permissions dans le workflow**

Le workflow a été mis à jour avec :
```yaml
permissions:
  contents: read
  packages: write
```

---

### 🧪 **Test de la solution**

Après avoir appliqué une solution :

```bash
# 1. Forcer un nouveau build
git commit --allow-empty -m "test: trigger CI/CD"
git push origin master

# 2. Surveiller les logs
# GitHub → Actions → Dernier workflow → Logs détaillés
```

### 📊 **Vérification du succès**

**Le workflow devrait :**
1. ✅ Se connecter au registry sans erreur
2. ✅ Builder l'image Docker  
3. ✅ Pousser vers `ghcr.io/florent228/faas-frontend:latest`
4. ✅ Afficher un résumé de succès

**Votre image sera visible :**
- **Interface web** : `https://github.com/florent228/faas-frontend/pkgs/container/faas-frontend`
- **CLI** : `docker pull ghcr.io/florent228/faas-frontend:latest`

---

### ❌ **Si ça ne marche toujours pas**

#### **Diagnostic approfondi**

1. **Vérifier les permissions repository :**
   ```bash
   # Aller sur https://github.com/florent228/faas-frontend/settings/actions
   # Screenshot des paramètres actuels
   ```

2. **Vérifier les permissions organisation :**
   ```bash
   # Aller sur https://github.com/organizations/florent228/settings/actions
   # Vérifier si vous y avez accès
   ```

3. **Logs détaillés du workflow :**
   ```bash
   # Actions → Dernier run → "Login to GitHub Container Registry"
   # Copier l'erreur exacte
   ```

#### **Alternative : Docker Hub**

Si GitHub Container Registry pose trop de problèmes :

```bash
# Restaurer la version Docker Hub
git checkout HEAD~1 -- .github/workflows/docker-publish.yml
# Puis suivre le guide Docker Hub original
```

---

### 📞 **Aide supplémentaire**

**Documentation GitHub :**
- [Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Organization permissions](https://docs.github.com/en/organizations/managing-organization-settings/disabling-or-limiting-github-actions-for-your-organization)

**Vérification rapide :**
```bash
# Test manual avec votre token
echo $GITHUB_TOKEN | docker login ghcr.io -u florent228 --password-stdin
```

Le problème sera résolu avec une de ces solutions ! 🚀 