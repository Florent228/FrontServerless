# Rapport Descriptif - Pages et Onglets de Test des Fonctions Serverless

## 📋 Vue d'Ensemble de l'Application

L'application **FaaS Dashboard** est une interface Vue 3 moderne dédiée au test et à la gestion de **3 fonctions serverless OpenFaaS** spécialisées dans la sécurité utilisateur :

1. **Génération de mots de passe sécurisés** (24 caractères + QR code)
2. **Génération de secrets 2FA TOTP** (compatible Google Authenticator)
3. **Authentification complète** (login + password + 2FA)

---

## 🗂️ Architecture de Navigation

### Menu Principal (AppNavigation.vue)
La navigation principale propose 5 sections organisées :

| Page | Route | Icône | Fonction |
|------|-------|--------|----------|
| **Dashboard Serverless** | `/` | HomeIcon | Vue d'ensemble et monitoring |
| **Fonctions Serverless** | `/functions` | CubeIcon | **Page principale de test** |
| **Créer utilisateur sécurisé** | `/create-user` | UserPlusIcon | Création avec fonctions auto |
| **Test auth serverless** | `/auth-test` | ShieldCheckIcon | Test authentification dédiée |
| **Journal des fonctions** | `/audit-log` | DocumentTextIcon | Historique et monitoring |

---

## 🎯 Page Principale de Test : `/functions` (ServerlessFunctions.vue)

### Structure Générale
- **Fichier** : `src/views/ServerlessFunctions.vue` (787 lignes)
- **Fonction** : Interface principale pour tester les 3 fonctions serverless
- **Design** : Interface à onglets avec formulaires spécialisés

### En-tête et Statut de Connexion
```typescript
// Indicateur de statut OpenFaaS
connectionStatus: boolean
config.baseUrl: string // URL du gateway OpenFaaS
```

#### Fonctionnalités :
- 🟢 **Voyant de statut** : Connexion OpenFaaS (vert/rouge)
- 🔄 **Test de connexion** : Bouton avec loader pour vérifier la connectivité
- 📡 **URL affichée** : Configuration du gateway visible

---

## 🗂️ Système d'Onglets de Test

### Configuration des Onglets
```typescript
const tabs = [
  { id: 'password', name: 'Génération Mot de Passe', icon: KeyIcon },
  { id: '2fa', name: 'Secret 2FA TOTP', icon: ShieldCheckIcon },
  { id: 'auth', name: 'Authentification', icon: LockClosedIcon }
]
```

---

## 🔐 Onglet 1 : Génération de Mot de Passe

### Interface Utilisateur
#### Formulaire de Saisie :
- **ID Utilisateur** : `input` (ex: "user-12345")
- **Nom d'utilisateur** : `input` (ex: "john.doe")
- **Bouton d'action** : "🔐 Générer le mot de passe"

#### État de Chargement :
```typescript
isGeneratingPassword: boolean
// Affichage : spinner + "Génération en cours..."
```

#### Zone de Résultats :
##### ✅ **Succès** (Fond vert) :
- **Mot de passe généré** : 24 caractères avec bouton œil (masquer/afficher)
- **Date d'expiration** : Formatée avec émoji horloge
- **QR Code** : Image PNG base64 (transmission unique)
- **Dimensions** : 32x32 pixels avec bordure

##### ❌ **Erreur** (Fond rouge) :
- **Message d'erreur** détaillé
- **Gestion des timeouts** et erreurs de connexion

---

## 🛡️ Onglet 2 : Génération Secret 2FA

### Interface Utilisateur
#### Formulaire de Saisie :
- **ID Utilisateur** : `input` (validation requise)
- **Nom d'utilisateur** : `input` (validation requise)
- **Application name** : `input` (optionnel, pour QR code)

#### Zone de Résultats 2FA :
##### ✅ **Succès** :
- **Secret TOTP** : Chaîne base32 (ex: "JBSWY3DPEHPK3PXP")
- **QR Code** : Compatible Google Authenticator / Authy
- **URL TOTP** : Lien complet pour apps de 2FA
- **Codes de récupération** : 6 codes de backup affichés

##### 📱 **Instructions d'usage** :
- Guide pour scanner le QR code
- Liste des applications compatibles
- Procédure de sauvegarde des codes de récupération

---

## 🔐 Onglet 3 : Test d'Authentification

### Interface Spécialisée
#### Formulaire Triple Authentification :
- **Username** : `input` (validation en temps réel)
- **Password** : `input` avec bouton œil + indicateur de force
- **Code 2FA** : `input` 6 chiffres (pattern validation)
- **Remember me** : `checkbox`

#### Zone de Résultats Auth :
##### ✅ **Authentification Réussie** :
- **Token JWT** : Affiché de manière sécurisée
- **Informations utilisateur** : Nom, email, rôle
- **Session info** : Durée de validité, permissions

##### ⏰ **Identifiants Expirés** :
- **Message d'expiration** clair
- **Date d'expiration** affichée
- **Actions recommandées** pour renouvellement

---

## 📊 Page Dashboard : `/` (Dashboard.vue)

### Vue d'Ensemble des Tests
#### KPI Cards (4 métriques) :
1. **Fonctions Déployées** : Nombre total (3 par défaut)
2. **Appels Aujourd'hui** : Compteur + évolution
3. **Temps de Réponse Moyen** : Performance en ms
4. **Utilisateurs Authentifiés** : Taux de succès

#### Tableau des Appels Récents :
- **10 derniers appels** de fonctions
- **Colonnes** : Fonction, Utilisateur, Statut, Temps, Date
- **Filtrage** par type de fonction
- **Actualisation** en temps réel (debounce 500ms)

---

## 🧪 Page Test Auth Dédiée : `/auth-test` (AuthTest.vue)

### Interface de Test Avancée
#### Formulaire Optimisé :
- **Validation en temps réel** des champs
- **Analyse de force** du mot de passe (PasswordStrengthMeter)
- **Auto-complétion** sécurisée
- **Gestion des erreurs** inline

#### Résultats Détaillés :
- **Profil utilisateur** complet si succès
- **Codes d'erreur** spécifiques
- **Métriques de performance** (temps de réponse)
- **Logs de sécurité** intégrés

---

## 👤 Page Création Utilisateur : `/create-user` (CreateUser.vue)

### Intégration des Fonctions Serverless
#### Options Automatisées :
- ☑️ **Auto-génération mot de passe** via fonction serverless
- ☑️ **Génération 2FA automatique** lors de la création
- **Modal de succès** avec révélation sécurisée des credentials

#### Workflow Intégré :
1. **Saisie** des informations utilisateur
2. **Appel automatique** des fonctions de génération
3. **Affichage sécurisé** des résultats (QR codes, mots de passe)
4. **Sauvegarde** en base avec chiffrement

---

## 📋 Page Audit et Monitoring : `/audit-log` (AuditLog.vue)

### Surveillance des Tests
#### Filtres Avancés :
- **Par utilisateur** : Dropdown des utilisateurs
- **Par fonction** : password-generator / 2fa-generator / user-auth
- **Par période** : Date de début et fin
- **Par statut** : Succès / Échec

#### Table de Logs :
- **Colonnes** : Date/Heure, Fonction, Utilisateur, Statut, Temps, IP
- **Pagination** avec navigation
- **Export** des données (CSV/JSON)
- **Actualisation** temps réel

#### Métriques Visibles :
- **Taux de succès** par fonction
- **Temps de réponse moyen**
- **Pics d'utilisation**
- **Erreurs fréquentes**

---

## 🔧 Services et APIs

### Service Principal : `serverlessApi.ts`

#### Configuration :
```typescript
DEFAULT_CONFIG = {
  baseUrl: 'http://localhost:8080', // OpenFaaS Gateway
  functions: {
    passwordGeneration: '/function/password-generator',
    twoFactorGeneration: '/function/2fa-generator',
    authentication: '/function/user-auth'
  }
}
```

#### Services Exposés :
1. **passwordGenerationService.generatePassword()**
2. **twoFactorGenerationService.generateTwoFactor()**
3. **authenticationService.authenticate()**
4. **monitoringService.getStats()**

---

## 🎨 Composants UI Spécialisés

### Composants de Test :
- **PasswordStrengthMeter.vue** : Analyse de force en temps réel
- **UserCreatedModal.vue** : Révélation sécurisée des credentials
- **KPICard.vue** : Métriques visuelles du dashboard
- **AuditLogRow.vue** : Ligne d'historique formatée

### Fonctionnalités UX :
- **Animations** : Transitions fluides entre onglets
- **Loading states** : Spinners et états de chargement
- **Toast notifications** : Retours utilisateur en temps réel
- **Dark mode** : Interface adaptative jour/nuit
- **Responsive design** : Optimisé mobile et desktop

---

## 🔐 Sécurité et Bonnes Pratiques

### Gestion des Données Sensibles :
- **Masquage automatique** des mots de passe
- **Expiration des QR codes** après utilisation
- **Chiffrement** des credentials en transit
- **Validation côté client** et serveur

### Monitoring et Logging :
- **Traçabilité complète** des appels de fonctions
- **Métriques de performance** en temps réel
- **Alertes** en cas d'échec répétés
- **Audit trail** complet des actions utilisateur

---

## 📱 Responsive et Accessibilité

### Design Adaptatif :
- **Menu mobile** : Burger menu pour petits écrans
- **Tables responsives** : Défilement horizontal sur mobile
- **Formulaires optimisés** : Disposition adaptative
- **Touch-friendly** : Boutons dimensionnés pour mobile

### Standards d'Accessibilité :
- **ARIA labels** sur tous les éléments interactifs
- **Navigation clavier** complète
- **Contraste** respectant WCAG 2.1
- **Screen reader** compatible

---

## 🚀 Technologies Utilisées

### Stack Frontend :
- **Vue 3** avec Composition API
- **TypeScript** pour le typage strict
- **TailwindCSS** pour le styling
- **Heroicons** pour l'iconographie
- **Vue Router** pour la navigation
- **Pinia** pour la gestion d'état

### Tests et Qualité :
- **Vitest** pour les tests unitaires
- **Cypress** pour les tests E2E
- **ESLint** et **Prettier** pour la qualité de code
- **Lighthouse CI** pour les performances

---

Cette architecture offre une interface complète et intuitive pour tester les fonctions serverless OpenFaaS, avec une attention particulière portée à la sécurité, l'expérience utilisateur et la traçabilité des opérations. 