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
POST /function/pass-gen
```

### Payload
```json
{
  "username": "username"
}
```

### Réponse
```json
{
  "success": true,
  "userId": 11,
  "password": "NsOGMAfjuBmMf5HZowC_Tpip",
  "qrCode": "iVBORw0KGgoAAAANSUhEUgAAAUoAAAFKAQAAAABTUiuoAAACBElEQVR4nO2ay63bMBBFz0QCvJSBFOBS6A5SUmp6HVCluIAA4lIAhZsFRUv2AwIngZ65mFnYGvssLjAYcj4y8aKN314lwVFHHXXUUUePRG21HrumHsYzQKo/Xw8X4OhrJkkiSJKmTjCsLmHqtPs3vl2ro/36nc4QPlZHo3VZJDDo8qECHP0PVDGZETTX8++rBTj6B+uffAvTGUjfZV8jwNF/iNYgIIFIXWb8sR5/+9757VodXaM1lkzqsPABFm59BpaH/Hq7VkdLtLYUEgk0XmbTY2Y1oNXRtd+6stTm6jIbpJMYz2DX5P1WO2jptxTpBEOGMIHiIEkTbO2X91vNoPZTsymmrUJcrAw0wq1/RI8R4OhrtubWIEnKAN19qpFRZB1oeG61g4Zbj5n1EKbFGC8Zwu0kYPF7qxm0nHMW4myCpRcIYwAYMsbwq9eRAhz9+6lueZo6AZ0UAcUhQ1DGq4xW0N0Mfpu8l/F7pH74vdUIWqM1VTcCpZYvNsij1QyKHo2gTGm1glR7MI9WS+i2O2a0k8zOnSD198KwIa2O1t0xwDDb7jgcL/kJPUaAoy/Z7t4K0378VM2rjJbRMtC9l4OTd8ftooosVnNrMbsOfhK2gz7vjimbfoAgsHFbSL5dq6O7WQbUtUm9y/YvrPm91QD6eXdcPUEujz4ndNRRRx11tBX0N3irVZ4Qix9rAAAAAElFTkSuQmCC",
  "encryptedPassword": "gAAAAABoa8v2AOR0EYUYCOcAsoSIgTUESu_u6_IyrgAENETmBGpAdx2aV027Ybc5qufrP0s_MOIaLfFtVlKjHCoNFQY9bIF8x1KiWZ_a_NSgJCtY5x_qbpc=",
  "expiresAt": "Sat, 03 Jan 2026 13:30:30 GMT",
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
POST /function/mfa-generator
```

### Payload
```json
{
  "username": "username"
}
```

### Réponse
```json
{
  "success": true,
  "userId": 11,
  "secret": "CVHLAMMGGPTLNJ7FNVPS5OXR5EGQFR45",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASIAAAEiAQAAAAB1xeIbAAABf0lEQVR4nO2aTY6EIBSE6w0kvcRkDuBR4Gp9Mz3K3ECWJnRqFqDdzk9mNrQ2PhZGyZdQweezUirE32N8+wcEKKWUUkopdXRKyrCQgJsAcZkJu+o6BeVJkhMAxAsBGJIkt9TzdZ2CiqXGObg5n4mI3V9Xy5T9ci2AIRDrrajUbxQHN8tTV1TKkRyWSQkASKb9dbVMlZ4z5lo3EP9xoQC3TfEfVf1rU3nvH4MFNwvgtlHDUdW3QEmIIhhFhNcOAKIFxu6m/r4mhWzj/bRt8DDF7nuSHI6qvgWK1z5BQrQgp+UujL2+a6tSud8LYMGHvh87AM5Q9tJ1Bqr0HLiE7DE9SXim9QnQnlOLKru7jnwXOJls93Xvq1P3HDNfBjcLPBMk7KqrbWrxOTnHNGuEmbB4H6372tSaY5KpRJhjT0rYWVfL1A85JsDsc6Isxueo6pujTK52/XbyLGrJMfPh2ifc+9Dx1b8m9T3HnN4BwFD8kKz2nIqU6L9RSimllFKnoD4Bt3HKv+LnALkAAAAASUVORK5CYII=",
  "backupCodes": ["870429", "747229", "391244", "601140", "238860", "488005"],
  "encryptedSecret": "gAAAAABoa8wReBm9el1qEcTRUv-AyRYM2OvAo1Nn4oZXC_cUEsPDYtWB-Q02lLaT2veo5tGwjqaEFUUQyHkLK2wQaKTG-qvidyo6myBAqRvj6OaqoMNks4KKl0bZGC1feRvMYnEZ8V4yXfHiOYP3j2SK-ssXDcJwWsgO9XjpBmTITO-EnxR-951CpLd-PZmGlGAo892tzHH0kexaRAPfhwvfp_WgyFtsf3jvwUzP40eWPQGCpW0T7TNZD4vqzUDzsUqvzgIUye8V2LnwYzUUQl7MYJCvmhWeqqK7ewFdSiA0-TTPdGeHoLmeo8H6y6PRZjjcpFJJG-zdu3bDdxS95RY160VFz3Ecnm9Ngo6en0gzY9QxTAh2UZ5aH5mUb7SAe54zvJdZKkbW_76hvPrNEBwxEo0b2exlkd9ZlCumCQTwWY9I5ARzKI1vpdrjw59luW04UHr_xXne0rHb-0Bga0hb4nGa2igslYd9LsnCB5_Y7e4YKirWh-UaZhAYkC57uI00fcpmNZda2GJPHg23UXrldRgXqM_TWjVSnCoOKNigCPAf7p01YSAHpE-Zpituza2e-o-A_cF2FO9ekziPoF4bA3jSBcqv-A0okzXQV36ZYxmd8u6q2SL-R2ZXorrfQOaRbx9q0SewHGsjcNDHvv66WhvvPWkhxzPovYq6xmRJpQEllA0qp5euO0YXXq07K9iJleII9KC9s9Xo1HWJD3Wf7qX8AiDHmw==",
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
  "username": "username",
  "password": "NsOGMAfjuBmMf5HZowC_Tpip",
  "mfa_code": "601140"
}
```

### Réponse - Succès
```json
{
  "success": true,
  "authenticated": true,
  "userId": 11,
  "username": "username",
  "message": "Authentification réussie."
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