# Guide d'intégration OpenFaaS

Ce guide explique comment intégrer le frontend Vue 3 avec les fonctions serverless OpenFaaS.

## 🏗️ Architecture intégrée

```
Frontend Vue 3 ↔ serverlessApi.ts ↔ OpenFaaS Gateway ↔ Fonctions Serverless
```

## ⚙️ Configuration

### Développement (avec proxy Vite)

Pour le développement, utilisez le proxy Vite (aucune variable d'environnement nécessaire) :

```env
# Optionnel : laissez vide pour utiliser le proxy Vite
# VITE_OPENFAAS_URL=
```

Le proxy Vite est configuré dans `vite.config.ts` pour rediriger :
- `/function/*` → `http://localhost:8080/function/*`
- `/system/*` → `http://localhost:8080/system/*`

### Configuration de production

```env
# Configuration de production
VITE_OPENFAAS_URL=https://your-openfaas-gateway.com
VITE_OPENFAAS_NAMESPACE=production

# Fonctions OpenFaaS - endpoints
VITE_FUNCTION_PASSWORD_GENERATOR=pass-gen
VITE_FUNCTION_2FA_GENERATOR=mfa-generator
VITE_FUNCTION_USER_AUTH=user-auth
```

## 📡 Fonctions intégrées

### 1. Génération de mot de passe (`/function/pass-gen`)

**Frontend → API :**
```typescript
await passwordGenerationService.generatePassword({
  username: "username"
})
```

**Réponse attendue :**
```json
{
  "success": true,
  "userId": 11,
  "password": "NsOGMAfjuBmMf5HZowC_Tpip",
  "qrCode": "iVBORw0KGgoAAAANSUhEUgAA...",
  "encryptedPassword": "gAAAAABoa8v2AOR...",
  "expiresAt": "Sat, 03 Jan 2026 13:30:30 GMT",
  "message": "Mot de passe généré avec succès"
}
```

### 2. Génération 2FA (`/function/mfa-generator`)

**Frontend → API :**
```typescript
await twoFactorGenerationService.generateTwoFactor({
  username: "username"
})
```

**Réponse attendue :**
```json
{
  "success": true,
  "userId": 11,
  "secret": "CVHLAMMGGPTLNJ7FNVPS5OXR5EGQFR45",
  "qrCode": "data:image/png;base64,iVBORw0K...",
  "backupCodes": ["870429", "747229", "391244", "601140", "238860", "488005"],
  "encryptedSecret": "gAAAAABoa8wReBm9el1q...",
  "message": "Secret 2FA généré avec succès"
}
```

### 3. Authentification (`/function/user-auth`)

**Frontend → API :**
```typescript
await authenticationService.authenticate({
  username: "username",
  password: "NsOGMAfjuBmMf5HZowC_Tpip",
  mfa_code: "601140"
})
```

**Réponse attendue :**
```json
{
  "success": true,
  "authenticated": true,
  "userId": 11,
  "username": "username",
  "message": "Authentification réussie."
}
```

## 🎯 Utilisation de l'interface

### Accès à l'interface

1. Démarrez le frontend : `npm run dev`
2. Naviguez vers `/functions` dans votre navigateur
3. Configurez l'URL OpenFaaS si nécessaire

### Test des fonctions

1. **Configuration** : Vérifiez l'URL OpenFaaS en haut de la page
2. **Test de connexion** : Cliquez sur "Tester connexion" pour vérifier la disponibilité
3. **Génération de mot de passe** :
   - Onglet "Mot de passe"
   - Saisissez un nom d'utilisateur
   - Cliquez sur "Générer le mot de passe"
   - Le QR code et le mot de passe s'affichent
4. **Génération 2FA** :
   - Onglet "2FA TOTP"
   - Saisissez un nom d'utilisateur  
   - Cliquez sur "Générer le secret 2FA"
   - Le QR code TOTP et les codes de récupération s'affichent
5. **Authentification** :
   - Onglet "Authentification"
   - Saisissez username, password et code 2FA
   - Cliquez sur "Authentifier"
   - Le résultat d'authentification s'affiche

### Historique des appels

L'onglet "Historique" affiche tous les appels effectués avec :
- Nom de la fonction appelée
- Utilisateur concerné
- Statut (succès/échec)
- Temps de réponse
- Timestamp
- Adresse IP

## 🔧 Services intégrés

### `serverlessApi.ts`

Le fichier `src/services/serverlessApi.ts` contient :

- **Configuration** : Endpoints et URL OpenFaaS
- **Services** : `passwordGenerationService`, `twoFactorGenerationService`, `authenticationService`
- **Monitoring** : `monitoringService` pour les statistiques
- **Historique** : `historyService` pour l'historique des appels
- **Configuration** : `configService` pour la gestion de la config

### Interception des requêtes

Toutes les requêtes sont interceptées pour :
- Logging des appels (console)
- Gestion des erreurs
- Mesure des temps de réponse
- Stockage de l'historique

## 🚨 Gestion d'erreurs

### Erreurs de connexion

Si OpenFaaS n'est pas accessible :
- Indicateur rouge "Déconnecté"
- Messages d'erreur détaillés dans l'interface
- Historique des échecs d'appels

### Erreurs de fonctions

Les erreurs de fonctions sont capturées et affichées :
- Message d'erreur de la fonction
- Code d'erreur HTTP
- Temps de réponse (0 si échec immédiat)

## 🔍 Debug et monitoring

### Console développeur

Activez la console pour voir :
```
🚀 Appel fonction serverless: /function/pass-gen {username: "username"}
✅ Réponse fonction serverless: {success: true, userId: 11, ...}
```

### Historique des appels

L'historique local stocke :
- 1000 derniers appels maximum
- Informations complètes sur chaque appel
- Possibilité de vider l'historique

## 📋 Configuration avancée

### Timeout des requêtes

Par défaut : 30 secondes
```typescript
// Dans serverlessApi.ts
timeout: 30000
```

### URL de base personnalisée

Modifiable via l'interface ou par configuration :
```typescript
configService.updateConfig({
  baseUrl: 'https://your-custom-openfaas-url.com'
})
```

## ✅ Checklist de déploiement

- [ ] Fonctions OpenFaaS déployées et accessibles
- [ ] Variables d'environnement configurées
- [ ] URL OpenFaaS correcte dans la configuration
- [ ] Test de connexion réussi
- [ ] Test des 3 fonctions individuellement
- [ ] Vérification des QR codes générés
- [ ] Test des cas d'erreur
- [ ] Monitoring et logging fonctionnels

## 📝 Troubleshooting

### "Network Error" / Problèmes CORS

En développement, utilisez le proxy Vite (configuré automatiquement) :
1. **Redémarrez le serveur de développement** : `npm run dev`
2. **Vérifiez qu'OpenFaaS fonctionne** : `curl -X POST http://localhost:8080/function/pass-gen -H "Content-Type: application/json" -d '{"username": "test"}'`
3. **Laissez l'URL OpenFaaS vide** dans l'interface (utilise le proxy automatiquement)

### "OpenFaaS Déconnecté"

1. Vérifiez l'URL dans la configuration
2. Testez l'URL directement : `curl http://your-url/system/functions`
3. Vérifiez que les fonctions sont déployées : `faas-cli list`

### "Fonction non trouvée"

1. Vérifiez les noms des fonctions dans OpenFaaS
2. Confirmez les endpoints dans la configuration
3. Vérifiez les namespaces OpenFaaS

### "Erreur de payload"

1. Vérifiez le format des données envoyées
2. Consultez les logs des fonctions OpenFaaS
3. Testez directement avec `curl` ou Postman

## 🔗 Ressources

- [Documentation OpenFaaS](https://docs.openfaas.com/)
- [Guide des fonctions serverless](./SERVERLESS_FUNCTIONS.md)
- [Documentation Vue 3](https://vuejs.org/)
- [TypeScript](https://www.typescriptlang.org/) 