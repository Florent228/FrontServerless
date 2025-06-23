# Fonctions Serverless OpenFaaS

Ce document décrit les 3 fonctions serverless spécifiques développées pour ce projet.

## 🏗️ Architecture

Le frontend Vue 3 communique avec des fonctions OpenFaaS déployées sur Kubernetes :

```
Frontend Vue 3 → OpenFaaS Gateway → Fonctions Serverless
```

## 🔐 Fonction 1: Génération de Mot de Passe

### Description
Génère un mot de passe sécurisé de 24 caractères avec complexité fixe.

### Caractéristiques
- **Longueur**: 24 caractères exactement
- **Complexité**: Majuscules + minuscules + chiffres + caractères spéciaux
- **QR Code**: Généré pour transmission unique
- **Chiffrement**: Mot de passe stocké chiffré en base de données
- **Expiration**: 6 mois

### Endpoint
```
POST /function/password-generator
```

### Payload
```json
{
  "userId": "user-12345",
  "username": "john.doe"
}
```

### Réponse
```json
{
  "success": true,
  "userId": "user-12345",
  "password": "A2x$9Kp@8mL3#Qr7!Bc5&Nz1",
  "qrCode": "data:image/png;base64,iVBORw0K...",
  "encryptedPassword": "encrypted_hash_here",
  "expiresAt": "2024-07-15T10:30:00Z",
  "message": "Mot de passe généré avec succès"
}
```

## 🛡️ Fonction 2: Génération de Secret 2FA

### Description
Génère un secret TOTP (Time-based One-Time Password) pour la double authentification.

### Caractéristiques
- **Type**: TOTP (RFC 6238)
- **QR Code**: Compatible Google Authenticator, Authy, etc.
- **Codes de récupération**: 6 codes de backup
- **Chiffrement**: Secret stocké chiffré en base de données

### Endpoint
```
POST /function/2fa-generator
```

### Payload
```json
{
  "userId": "user-12345",
  "username": "john.doe"
}
```

### Réponse
```json
{
  "success": true,
  "userId": "user-12345",
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,iVBORw0K...",
  "backupCodes": ["123456", "789012", "345678", "901234", "567890", "234567"],
  "encryptedSecret": "encrypted_secret_here",
  "message": "Secret 2FA généré avec succès"
}
```

## 🔐 Fonction 3: Authentification Utilisateur

### Description
Authentifie un utilisateur avec login + mot de passe + code 2FA avec vérification d'expiration.

### Caractéristiques
- **Triple authentification**: Username + Password + TOTP
- **Vérification d'expiration**: Contrôle des 6 mois
- **JWT Token**: Retourné si authentification réussie
- **Gestion expiration**: Indication de renouvellement nécessaire

### Endpoint
```
POST /function/user-auth
```

### Payload
```json
{
  "username": "john.doe",
  "password": "A2x$9Kp@8mL3#Qr7!Bc5&Nz1",
  "totpCode": "123456"
}
```

### Réponse - Succès
```json
{
  "success": true,
  "authenticated": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "user-12345",
  "username": "john.doe",
  "message": "Authentification réussie"
}
```

### Réponse - Expiration
```json
{
  "success": false,
  "authenticated": false,
  "expired": true,
  "expirationDate": "2024-01-15T10:30:00Z",
  "requiresRenewal": true,
  "message": "Identifiants expirés, renouvellement nécessaire"
}
```

### Réponse - Échec
```json
{
  "success": false,
  "authenticated": false,
  "error": "Identifiants invalides ou code 2FA incorrect"
}
```

## 🚀 Déploiement OpenFaaS

### Prérequis
- Cluster Kubernetes ou Docker Swarm
- OpenFaaS installé et configuré
- CLI `faas-cli` installé

### Images des conteneurs
Les fonctions seront packagées et publiées sur :
- **Docker Hub**: `username/password-generator:latest`
- **GitHub Container Registry**: `ghcr.io/username/2fa-generator:latest`
- **Registry privé**: `registry.company.com/user-auth:latest`

### Déploiement
```bash
# Déployer toutes les fonctions
faas-cli deploy -f stack.yml

# Déployer une fonction spécifique
faas-cli deploy -f password-generator.yml
faas-cli deploy -f 2fa-generator.yml
faas-cli deploy -f user-auth.yml
```

### Configuration des secrets
```bash
# Créer les secrets pour la base de données
kubectl create secret generic db-credentials \
  --from-literal=username=dbuser \
  --from-literal=password=dbpass

# Créer les secrets pour le chiffrement
kubectl create secret generic encryption-keys \
  --from-literal=password-key=password_encryption_key \
  --from-literal=2fa-key=2fa_encryption_key
```

## 🔧 Configuration Frontend

### Variables d'environnement
```env
VITE_OPENFAAS_URL=http://localhost:8080
VITE_FUNCTION_PASSWORD_GENERATOR=password-generator
VITE_FUNCTION_2FA_GENERATOR=2fa-generator
VITE_FUNCTION_USER_AUTH=user-auth
VITE_OPENFAAS_NAMESPACE=openfaas-fn
```

### Configuration de production
```env
VITE_OPENFAAS_URL=https://faas.company.com
VITE_OPENFAAS_NAMESPACE=production
```

## 📊 Monitoring et Observabilité

### Métriques disponibles
- Nombre d'appels par fonction
- Temps de réponse moyen
- Taux de succès/échec
- Utilisation des ressources

### Dashboards
- **Prometheus + Grafana**: Métriques détaillées
- **OpenFaaS UI**: Interface web de monitoring
- **Frontend**: Historique des appels dans l'interface

## 🧪 Tests

### Tests unitaires
```bash
# Tests des fonctions
npm run test:functions

# Tests d'intégration
npm run test:integration

# Tests E2E avec les vraies fonctions
npm run test:e2e
```

### Tests manuels
1. Naviguer vers `/functions` dans le frontend
2. Tester chaque fonction avec des données valides
3. Vérifier les QR codes générés
4. Tester les cas d'erreur

## 🔒 Sécurité

### Bonnes pratiques
- Mots de passe chiffrés avec des clés fortes
- Secrets 2FA chiffrés en base
- Communications HTTPS uniquement
- Validation stricte des entrées
- Rate limiting sur les API

### Gestion des clés
- Rotation régulière des clés de chiffrement
- Stockage sécurisé des secrets Kubernetes
- Audit des accès aux fonctions

## 📝 Changelog

### Version 1.0.0
- Implémentation des 3 fonctions de base
- Interface frontend Vue 3
- Tests unitaires et d'intégration
- Documentation complète 