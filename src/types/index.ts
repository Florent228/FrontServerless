// Types principaux de l'application

export interface User {
  id: string
  email: string
  name: string
  active: boolean
  role: 'admin' | 'user' | 'moderator'
  createdAt: string
  updatedAt: string
  lastLogin?: string
  avatar?: string
}

export interface CreateUserData {
  email: string
  name: string
  role: 'admin' | 'user' | 'moderator'
  password?: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: Record<string, string[]>
}

export interface KPIData {
  totalUsers: number
  activeUsers: number
  newUsersToday: number
  totalFunctions: number
  activeFunctions: number
  totalRequests: number
  averageResponseTime: number
  errorRate: number
}

export interface AuditLogEntry {
  id: string
  userId: string
  userName: string
  action: string
  resource: string
  resourceId?: string
  timestamp: string
  ipAddress: string
  userAgent: string
  details?: Record<string, any>
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

export interface AuthTestResult {
  success: boolean
  token?: string
  user?: User
  expiresAt?: string
  qrCode?: string
  message?: string
}

export interface PasswordStrength {
  score: number // 0-4
  feedback: string[]
  suggestions: string[]
}

export interface ToastOptions {
  title?: string
  description?: string
  duration?: number
  type?: 'success' | 'error' | 'warning' | 'info'
}

// Types pour les composants
export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
}

export interface FilterOption {
  label: string
  value: string | number
  count?: number
}

export interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
  }>
}

// Types pour les fonctions serverless
export interface ServerlessFunction {
  name: string
  description: string
  endpoint: string
  status: 'active' | 'inactive' | 'error'
  lastCalled?: Date
  callCount: number
}

// Fonction 1: Génération de mot de passe
export interface PasswordGenerationRequest {
  username: string
}

export interface PasswordGenerationResponse {
  success: boolean
  userId: number
  password: string // Mot de passe généré (24 caractères)
  qrCode: string // QR code en base64
  encryptedPassword: string // Mot de passe chiffré pour stockage
  expiresAt: string // Date d'expiration (6 mois)
  message?: string
  error?: string
}

// Fonction 2: Génération de secret 2FA
export interface TwoFactorGenerationRequest {
  username: string
}

export interface TwoFactorGenerationResponse {
  success: boolean
  userId: number
  secret: string // Secret TOTP
  qrCode: string // QR code TOTP en base64
  backupCodes: string[] // Codes de récupération
  encryptedSecret: string // Secret chiffré pour stockage
  message?: string
  error?: string
}

// Fonction 3: Authentification utilisateur
export interface AuthenticationRequest {
  username: string
  password: string
  mfa_code: string // Code 2FA (renommé de totpCode)
}

export interface AuthenticationResponse {
  success: boolean
  authenticated: boolean
  userId?: number
  username?: string
  expired?: boolean // True si les identifiants ont plus de 6 mois
  expirationDate?: string
  requiresRenewal?: boolean // True si renouvellement nécessaire
  message?: string
  error?: string
}

// États et statistiques des fonctions
export interface FunctionStats {
  totalCalls: number
  successRate: number
  averageResponseTime: number
  lastError?: string
  lastErrorTime?: Date
}

export interface DashboardStats {
  passwordGenerations: {
    total: number
    last24h: number
    successRate: number
  }
  twoFactorGenerations: {
    total: number
    last24h: number
    successRate: number
  }
  authentications: {
    total: number
    successful: number
    failed: number
    expired: number
    last24h: number
  }
  functionsStatus: {
    passwordFunction: 'healthy' | 'warning' | 'error'
    twoFactorFunction: 'healthy' | 'warning' | 'error'
    authFunction: 'healthy' | 'warning' | 'error'
  }
}

// Types pour les tests de fonctions
export interface FunctionTest {
  id: string
  functionName: string
  request: any
  response?: any
  success?: boolean
  responseTime?: number
  timestamp: Date
  error?: string
}

// Types pour l'historique des appels
export interface FunctionCall {
  id: string
  functionName: 'password-generation' | '2fa-generation' | 'authentication'
  userId?: string
  username?: string
  success: boolean
  responseTime: number
  timestamp: Date
  error?: string
  ipAddress?: string
}

// Configuration des fonctions serverless
export interface ServerlessConfig {
  baseUrl: string // URL du cluster OpenFaaS
  namespace?: string
  functions: {
    passwordGeneration: {
      name: string
      endpoint: string
    }
    twoFactorGeneration: {
      name: string
      endpoint: string
    }
    authentication: {
      name: string
      endpoint: string
    }
  }
}

// Types pour la gestion des erreurs
export interface ApiError {
  code: string
  message: string
  details?: any
  timestamp: Date
}

// Types pour la validation des entrées
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

// Types pour les logs d'audit spécifiques aux fonctions serverless
export interface AuditLog {
  id: string
  functionName: string
  action: 'password-generation' | '2fa-generation' | 'authentication' | 'function-test'
  userId?: string
  username?: string
  success: boolean
  responseTime: number
  request: any
  response?: any
  error?: string
  timestamp: Date
  ipAddress: string
  userAgent: string
}

// Export des types legacy pour compatibilité (à supprimer progressivement)
export interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'moderator' | 'admin'
  active: boolean
  createdAt: string
}

export interface PasswordStrength {
  score: number
  feedback: string[]
  crackTime: string
} 