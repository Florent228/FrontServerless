# FaaS Dashboard - Frontend Vue 3

Une **Single-Page Application (SPA) Vue 3** moderne et ultra-performante pour la gestion de fonctions serverless, conçue avec les meilleures pratiques UX/Performance.

## 🚀 Fonctionnalités

### ⚡ Performance & UX
- **LCP < 1.5s** et **CLS ≈ 0** (optimisé Lighthouse > 90)
- **Code splitting** automatique et **lazy loading**
- **Service Worker** avec cache intelligent
- **Table virtualisée** (> 50 utilisateurs)
- **Intersection Observer** pour animations fluides
- **Debounce 500ms** sur les actions critiques

### 🎨 Interface Utilisateur
- **Dark mode** avec détection système automatique
- **Design tokens** cohérents (Tailwind CSS v3)
- **Animations** avec reduced-motion support
- **Accessibilité** complète (ARIA, focus management)
- **Raccourcis clavier** (g+d, g+c, etc.)

### 🔐 Sécurité & Validation
- **Validation Zod** temps réel
- **Password strength meter** avec progressive disclosure
- **QR codes** pour authentification rapide
- **Révélation sécurisée** des mots de passe
- **Optimistic UI** avec revert automatique

### 📊 Composants
- **Dashboard** avec KPI cards et metrics
- **CreateUser** avec génération auto de password
- **UserDetail** avec drawer actions
- **AuthTest** avec validation inline
- **AuditLog** avec virtual list et export CSV

## 🛠 Stack Technique

| Domaine | Technologie | Optimisations |
|---------|-------------|---------------|
| **Framework** | Vue 3 + Composition API | Suspense, defineAsyncComponent |
| **Bundler** | Vite (ESBuild) | Code splitting, compression gzip/brotli |
| **Styling** | Tailwind CSS v3 JIT | Purge < 10kB, dark mode |
| **State** | Pinia | Tree-shaking, devtools disabled prod |
| **Router** | Vue Router | Lazy routes, prefetch hints |
| **HTTP** | Axios + retry | Timeout 10s, interceptors |
| **Validation** | Zod | Schema validation temps réel |
| **Tests** | Vitest + Cypress | Coverage 90%+ |
| **PWA** | Vite PWA Plugin | Service worker, manifest |

## 📦 Installation

### Prérequis
- **Node.js** >= 18.0.0
- **npm** ou **yarn**

### Configuration

```bash
# Cloner le repository
git clone <repository-url>
cd faas-frontend

# Installer les dépendances
npm install

# Copier les variables d'environnement
cp .env.example .env

# Configurer l'URL de l'API
echo "VITE_API_URL=http://localhost:3000" >> .env
```

### Développement

```bash
# Démarrer le serveur de développement
npm run dev

# Ouvrir http://localhost:5173
```

### Production

```bash
# Build optimisé
npm run build

# Preview du build
npm run preview

# Test Lighthouse
npm run lighthouse
```

## 🧪 Tests

### Tests unitaires (Vitest)
```bash
# Lancer les tests
npm run test

# Tests avec interface
npm run test:ui

# Coverage (seuil: 90%)
npm run test -- --coverage
```

### Tests E2E (Cypress)
```bash
# Tests headless
npm run test:e2e

# Interface Cypress
npm run test:e2e:open
```

### Qualité du code
```bash
# Linting
npm run lint

# Formatage
npm run format

# Vérification TypeScript
npm run type-check
```

## 🎯 Performance Targets

| Métrique Lighthouse | Seuil | Optimisation |
|-------------------|-------|--------------|
| **Performance** | ≥ 90 | Code splitting, lazy loading |
| **LCP** | < 1.5s | Preload, image optimization |
| **FID/INP** | < 100ms | Event delegation, debounce |
| **CLS** | < 0.01 | Skeleton UI, reveal components |
| **PWA** | Installable | Service worker, manifest |

## 🎨 Design System

### Couleurs
```js
const colors = {
  primary: '#2563eb',        // blue-600
  primaryDark: '#1d4ed8',    // blue-700
  danger: '#dc2626',         // red-600
  grayBg: '#f8fafc',        // slate-50
}
```

### Composants CSS
```css
.btn-primary     /* Bouton principal */
.btn-secondary   /* Bouton secondaire */
.btn-danger      /* Bouton de suppression */
.card           /* Carte avec ombre */
.input          /* Champ de saisie */
.input-error    /* État d'erreur */
```

## ⌨️ Raccourcis Clavier

| Raccourci | Action |
|-----------|--------|
| `g + d` | Dashboard |
| `g + c` | Créer utilisateur |
| `g + a` | Test authentification |
| `g + l` | Journal audit |
| `?` | Aide raccourcis |
| `t` | Basculer thème |
| `r` | Actualiser données |
| `Échap` | Fermer modales |

## 📁 Structure du Projet

```
src/
├── assets/           # Images, fonts, styles
├── components/       # Composants réutilisables
│   ├── dashboard/    # Composants dashboard
│   ├── forms/        # Composants formulaires
│   ├── layout/       # Layout et navigation
│   └── modals/       # Modales et overlays
├── composables/      # Logique réutilisable
├── plugins/          # Configuration tiers
├── router/           # Configuration routing
├── stores/           # État global Pinia
├── types/            # Définitions TypeScript
├── views/            # Pages principales
└── main.ts          # Point d'entrée
```

## 🔧 Configuration API

### Proxy Vite (développement)
```js
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: process.env.VITE_API_URL,
      changeOrigin: true,
    }
  }
}
```

### Endpoints attendus
```
GET    /api/users           # Liste utilisateurs
GET    /api/users/:id       # Détail utilisateur
POST   /api/users           # Créer utilisateur
DELETE /api/users/:id       # Supprimer utilisateur
GET    /api/kpi             # Données KPI
POST   /api/auth/test       # Test authentification
GET    /api/audit           # Journal audit
```

## 🎭 Dark Mode

```html
<!-- Détection automatique -->
<html class="dark">

<!-- Basculer via JavaScript -->
<script>
document.documentElement.classList.toggle('dark')
</script>
```

Configuration Tailwind :
```js
module.exports = {
  darkMode: 'class',
  // ...
}
```

## 📈 Optimisations Spécifiques

### 1. Code Splitting
```js
// Lazy loading avec prefetch
const Dashboard = () => import(
  /* webpackChunkName: "dashboard", webpackPrefetch: true */ 
  '@/views/Dashboard.vue'
)
```

### 2. Virtual Scrolling
```vue
<!-- Table virtualisée si > 50 éléments -->
<VirtualList :size="72" :remain="8" :bench="5">
  <UserRow v-for="user in users" :key="user.id" />
</VirtualList>
```

### 3. Intersection Observer
```js
// Animation au scroll
const { isVisible, animationTarget } = useScrollAnimation()
```

### 4. Image Optimization
```html
<!-- WebP avec fallback -->
<img 
  src="image.webp" 
  loading="lazy" 
  decoding="async"
  alt="Description"
/>
```

## 🚀 Déploiement

### Build de production
```bash
npm run build
```

Génère un dossier `dist/` optimisé avec :
- **Compression gzip/brotli**
- **Chunking intelligent**
- **Tree-shaking complet**
- **CSS purifié < 10kB**

### Variables d'environnement
```bash
# .env.production
VITE_API_URL=https://api.example.com
VITE_SENTRY_DSN=https://...
```

### Serveur Web
Configuration nginx recommandée :
```nginx
location / {
  try_files $uri $uri/ /index.html;
  add_header Cache-Control "no-cache";
}

location /assets/ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}
```

## 🛡️ Sécurité

- **HTTPS** obligatoire en production
- **CSP** headers recommandés
- **Sanitization** automatique des inputs
- **Validation côté client ET serveur**
- **Tokens JWT** avec expiration

## 🐛 Debug & Monitoring

### Mode développement
- **Vue DevTools** support
- **Pinia DevTools** intégré
- **Hot Module Replacement**
- **TypeScript strict mode**

### Monitoring production
- Intégration **Sentry** possible
- **Lighthouse CI** automatique
- **Bundle analyzer** : `npm run build -- --analyze`

## 📄 License

MIT License - voir le fichier [LICENSE](LICENSE)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

---

**Développé avec ❤️ pour une expérience utilisateur exceptionnelle** 