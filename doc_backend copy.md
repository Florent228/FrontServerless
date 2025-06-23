# Documentation Backend - Spécifications API pour les Fonctions Serverless

## 📋 Vue d'ensemble

Cette documentation s'adresse aux développeurs backend responsables de l'implémentation des **3 fonctions serverless OpenFaaS** requises par le frontend Vue.js. Elle détaille les contrats d'API, les formats de données, et les comportements attendus.

## 🏗️ Architecture générale

Le frontend s'attend à communiquer avec **3 fonctions serverless distinctes** déployées sur OpenFaaS :

1. **`password-generator`** - Génération de mots de passe sécurisés
2. **`2fa-generator`** - Génération de secrets 2FA TOTP
3. **`user-auth`** - Authentification utilisateur avec 2FA

### Base URL
```
https://your-openfaas-gateway.domain.com/function/
```

---

## 🔐 1. Fonction: password-generator

### Endpoint
```
POST /function/password-generator
```

### Description
Génère un mot de passe sécurisé de 24 caractères avec complexité fixe, QR code pour transmission unique, chiffrement et expiration à 6 mois.

### Request Body
```json
{
  "userId": "string",        // ID unique de l'utilisateur (requis)
  "username": "string"       // Nom d'utilisateur (requis)
}
```

### Response Success (200)
```json
{
  "success": true,
  "userId": "user-12345",
  "password": "A2x$9Kp@8mL3#Qr7!Bc5&Nz1",     // 24 caractères exacts
  "qrCode": "data:image/png;base64,iVBORw0K...", // Base64 PNG
  "encryptedPassword": "enc_base64_encrypted",    // Mot de passe chiffré pour stockage
  "expiresAt": "2024-07-15T10:30:00.000Z",      // Date d'expiration (6 mois)
  "message": "Mot de passe généré avec succès"
}
```

### Response Error (400/500)
```json
{
  "success": false,
  "userId": "user-12345",
  "password": "",
  "qrCode": "",
  "encryptedPassword": "",
  "expiresAt": "1970-01-01T00:00:00.000Z",
  "error": "Description de l'erreur"
}
```

### Spécifications techniques
- **Mot de passe** : Exactement 24 caractères
- **Complexité** : Majuscules, minuscules, chiffres, caractères spéciaux
- **QR Code** : Format PNG en base64, taille recommandée 200x200px
- **Chiffrement** : AES-256 recommandé pour `encryptedPassword`
- **Expiration** : Exactement 6 mois à partir de la génération
- **Temps de réponse** : Cible < 2 secondes

---

## 🛡️ 2. Fonction: 2fa-generator

### Endpoint
```
POST /function/2fa-generator
```

### Description
Génère un secret 2FA TOTP avec QR code, codes de récupération, chiffrement et stockage sécurisé.

### Request Body
```json
{
  "userId": "string",        // ID unique de l'utilisateur (requis)
  "username": "string"       // Nom d'utilisateur (requis)
}
```

### Response Success (200)
```json
{
  "success": true,
  "userId": "user-12345",
  "secret": "JBSWY3DPEHPK3PXP",                  // Secret TOTP base32
  "qrCode": "data:image/png;base64,iVBORw0K...", // QR code base64
  "backupCodes": [                              // 6 codes de récupération
    "123456",
    "789012",
    "345678",
    "901234",
    "567890",
    "234567"
  ],
  "encryptedSecret": "enc_base64_encrypted",     // Secret chiffré pour stockage
  "message": "Secret 2FA généré avec succès"
}
```

### Response Error (400/500)
```json
{
  "success": false,
  "userId": "user-12345",
  "secret": "",
  "qrCode": "",
  "backupCodes": [],
  "encryptedSecret": "",
  "error": "Description de l'erreur"
}
```

### Spécifications techniques
- **Secret TOTP** : Format base32, longueur standard (16-32 caractères)
- **QR Code** : Format PNG en base64, contient `otpauth://totp/...`
- **Codes de récupération** : Exactement 6 codes de 6 chiffres
- **Chiffrement** : AES-256 pour `encryptedSecret`
- **Compatibilité** : Google Authenticator, Authy, Microsoft Authenticator
- **Temps de réponse** : Cible < 1.5 secondes

---

## 🔑 3. Fonction: user-auth

### Endpoint
```
POST /function/user-auth
```

### Description
Authentifie un utilisateur avec login + mot de passe + code 2FA, vérifie l'âge des identifiants (< 6 mois), et retourne un JWT ou demande de renouvellement.

### Request Body
```json
{
  "username": "string",      // Nom d'utilisateur (requis)
  "password": "string",      // Mot de passe (requis)
  "twoFACode": "string"      // Code 2FA à 6 chiffres (requis)
}
```

### Response Success - Authentification réussie (200)
```json
{
  "success": true,
  "authenticated": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  // JWT token
  "userId": "user-12345",
  "username": "jean.dupont",
  "message": "Authentification réussie"
}
```

### Response Success - Identifiants expirés (200)
```json
{
  "success": false,
  "authenticated": false,
  "expired": true,
  "expirationDate": "2023-06-15T10:30:00.000Z",  // Date d'expiration
  "requiresRenewal": true,
  "message": "Identifiants expirés, renouvellement nécessaire"
}
```

### Response Error - Échec authentification (401)
```json
{
  "success": false,
  "authenticated": false,
  "error": "Identifiants invalides ou code 2FA incorrect"
}
```

### Response Error - Serveur (500)
```json
{
  "success": false,
  "authenticated": false,
  "error": "Erreur interne du serveur"
}
```

### Spécifications techniques
- **Vérification âge** : Les identifiants ne doivent pas dépasser 6 mois
- **JWT Token** : Format standard, expiration recommandée 1h-24h
- **Code 2FA** : Validation TOTP avec tolérance de ±1 période (30s)
- **Sécurité** : Limitation du taux de tentatives (rate limiting)
- **Temps de réponse** : Cible < 2 secondes

---

## 📊 4. Monitoring et Observabilité

### Métriques attendues par le frontend

Le frontend récupère des statistiques via des endpoints additionnels (optionnels mais recommandés) :

#### GET /function/stats
```json
{
  "totalFunctions": 3,
  "activeFunctions": 3,
  "totalCalls": 1250,
  "newCallsToday": 45,
  "averageResponseTime": 1200,
  "errorRate": 2,
  "authenticatedUsers": 89
}
```

#### Logs des appels de fonctions
Format attendu pour les logs d'audit :
```json
{
  "id": "call-12345",
  "functionName": "password-generator",  // ou "2fa-generator", "user-auth"
  "username": "jean.dupont",
  "success": true,
  "responseTime": 1850,                  // en millisecondes
  "timestamp": "2024-01-15T10:30:00.000Z",
  "ipAddress": "192.168.1.100"
}
```

---

## 🚨 Gestion des erreurs

### Codes de statut HTTP
- **200** : Succès (même pour les échecs d'authentification)
- **400** : Erreur de validation des paramètres
- **401** : Non autorisé (pour user-auth uniquement)
- **429** : Trop de requêtes (rate limiting)
- **500** : Erreur interne du serveur

### Format d'erreur standardisé
```json
{
  "success": false,
  "error": "Message d'erreur lisible",
  "code": "ERROR_CODE_OPTIONAL",
  "details": {
    "field": "description de l'erreur"
  }
}
```

---

## 🔧 Configuration et Variables d'environnement

### Variables requises
```bash
# Chiffrement
ENCRYPTION_KEY=base64_encoded_256_bit_key
ENCRYPTION_ALGORITHM=aes-256-gcm

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=24h

# Base de données (pour stockage des utilisateurs/mots de passe)
DATABASE_URL=mongodb://...
# ou
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=faas_auth
DATABASE_USER=faas_user
DATABASE_PASSWORD=secure_password

# Rate Limiting
RATE_LIMIT_WINDOW=900000  # 15 minutes en ms
RATE_LIMIT_MAX_REQUESTS=5 # tentatives par fenêtre

# QR Code
QR_CODE_SIZE=200
QR_CODE_FORMAT=PNG
```

---

## 🧪 Tests et Validation

### Scénarios de test requis

#### password-generator
1. ✅ Génération réussie avec userId et username valides
2. ❌ Erreur avec userId manquant
3. ❌ Erreur avec username manquant
4. ✅ Vérification format mot de passe (24 caractères, complexité)
5. ✅ Vérification format QR code (base64 PNG valide)

#### 2fa-generator
1. ✅ Génération réussie avec paramètres valides
2. ✅ Vérification secret TOTP (base32 valide)
3. ✅ Vérification 6 codes de récupération
4. ✅ QR code compatible avec Google Authenticator

#### user-auth
1. ✅ Authentification réussie avec credentials valides
2. ❌ Échec avec mot de passe incorrect
3. ❌ Échec avec code 2FA incorrect
4. ⚠️ Gestion identifiants expirés (> 6 mois)
5. ✅ JWT token valide retourné

### Commandes de test
```bash
# Test password-generator
curl -X POST https://your-gateway.com/function/password-generator \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-123","username":"testuser"}'

# Test 2fa-generator
curl -X POST https://your-gateway.com/function/2fa-generator \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-123","username":"testuser"}'

# Test user-auth
curl -X POST https://your-gateway.com/function/user-auth \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"TestPass123!","twoFACode":"123456"}'
```

---

## 🔐 Sécurité

### Recommandations de sécurité
1. **Chiffrement** : Tous les mots de passe et secrets 2FA doivent être chiffrés avant stockage
2. **Rate Limiting** : Limiter les tentatives d'authentification (5 tentatives / 15min)
3. **Logs** : Enregistrer tous les appels pour audit (sans données sensibles)
4. **HTTPS** : Toutes les communications doivent être chiffrées
5. **Validation** : Valider rigoureusement tous les paramètres d'entrée
6. **Timeout** : Configurer des timeouts appropriés (< 30s)

### Données sensibles à ne jamais logger
- Mots de passe en clair
- Secrets 2FA en clair
- Codes 2FA
- Clés de chiffrement

---

## 📚 Exemples d'implémentation

### Structure recommandée pour OpenFaaS

```yaml
# password-generator/stack.yml
version: 1.0
provider:
  name: openfaas
functions:
  password-generator:
    lang: node18
    handler: ./password-generator
    image: your-registry/password-generator:latest
    environment:
      ENCRYPTION_KEY: ${ENCRYPTION_KEY}
    secrets:
      - db-password
```

### Handler Node.js exemple
```javascript
// password-generator/handler.js
'use strict'

module.exports = async (event, context) => {
  try {
    const { userId, username } = JSON.parse(event.body)
    
    // Validation
    if (!userId || !username) {
      return context.succeed({
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: "userId et username sont requis"
        })
      })
    }
    
    // Génération du mot de passe
    const password = generateSecurePassword(24)
    const qrCode = await generateQRCode(password)
    const encryptedPassword = encrypt(password)
    
    return context.succeed({
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        userId,
        password,
        qrCode,
        encryptedPassword,
        expiresAt: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
        message: "Mot de passe généré avec succès"
      })
    })
    
  } catch (error) {
    return context.succeed({
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: "Erreur interne du serveur"
      })
    })
  }
}
```

---

## 🚀 Déploiement

### Prérequis
1. **OpenFaaS** installé et configuré
2. **Base de données** pour le stockage des utilisateurs
3. **Certificats SSL** pour HTTPS
4. **Variables d'environnement** configurées

### Commandes de déploiement
```bash
# Build et déploiement des 3 fonctions
faas-cli build -f stack.yml
faas-cli deploy -f stack.yml

# Vérification du statut
faas-cli list
```

### Tests post-déploiement
```bash
# Test de santé des fonctions
curl -X GET https://your-gateway.com/system/functions

# Test des endpoints
curl -X POST https://your-gateway.com/function/password-generator \
  -H "Content-Type: application/json" \
  -d '{"userId":"health-check","username":"test"}'
```

---

## 📞 Support et Contact

Pour toute question sur l'intégration ou les spécifications :

- **Frontend Developer** : [contact-frontend@domain.com]
- **Documentation** : Consultez `SERVERLESS_FUNCTIONS.md` pour plus de détails
- **Issues** : Utilisez le système de tickets pour signaler les problèmes d'intégration

---

## 📝 Changelog

| Version | Date | Changements |
|---------|------|-------------|
| 1.0.0   | 2024-01-15 | Spécifications initiales des 3 fonctions |

---

*Cette documentation doit être mise à jour à chaque modification des contrats d'API.*
