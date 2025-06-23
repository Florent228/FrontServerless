import axios from 'axios'
import type {
  PasswordGenerationRequest,
  PasswordGenerationResponse,
  TwoFactorGenerationRequest,
  TwoFactorGenerationResponse,
  AuthenticationRequest,
  AuthenticationResponse,
  ServerlessConfig,
  FunctionCall,
  DashboardStats
} from '@/types'

// Configuration par défaut des fonctions serverless
const DEFAULT_CONFIG: ServerlessConfig = {
  baseUrl: process.env.VITE_OPENFAAS_URL || 'http://localhost:8080',
  namespace: 'openfaas-fn',
  functions: {
    passwordGeneration: {
      name: 'password-generator',
      endpoint: '/function/password-generator'
    },
    twoFactorGeneration: {
      name: '2fa-generator',
      endpoint: '/function/2fa-generator'
    },
    authentication: {
      name: 'user-auth',
      endpoint: '/function/user-auth'
    }
  }
}

// Instance axios configurée pour OpenFaaS
const serverlessApi = axios.create({
  baseURL: DEFAULT_CONFIG.baseUrl,
  timeout: 30000, // 30 secondes pour les fonctions serverless
  headers: {
    'Content-Type': 'application/json',
  }
})

// Intercepteur pour logging des appels
serverlessApi.interceptors.request.use((config) => {
  console.log(`🚀 Appel fonction serverless: ${config.url}`, config.data)
  return config
})

serverlessApi.interceptors.response.use(
  (response) => {
    console.log(`✅ Réponse fonction serverless:`, response.data)
    return response
  },
  (error) => {
    console.error(`❌ Erreur fonction serverless:`, error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Service pour la génération de mots de passe
export const passwordGenerationService = {
  async generatePassword(request: PasswordGenerationRequest): Promise<PasswordGenerationResponse> {
    try {
      const startTime = Date.now()
      
      const response = await serverlessApi.post(
        DEFAULT_CONFIG.functions.passwordGeneration.endpoint,
        request
      )
      
      const responseTime = Date.now() - startTime
      
      // Enregistrer l'appel pour les statistiques
      await logFunctionCall({
        functionName: 'password-generation',
        userId: request.userId,
        username: request.username,
        success: response.data.success || false,
        responseTime,
        timestamp: new Date(),
        ipAddress: '127.0.0.1' // À récupérer depuis le client si nécessaire
      })
      
      return response.data
    } catch (error: any) {
      // Log de l'erreur
      await logFunctionCall({
        functionName: 'password-generation',
        userId: request.userId,
        username: request.username,
        success: false,
        responseTime: 0,
        timestamp: new Date(),
        error: error.message,
        ipAddress: '127.0.0.1'
      })
      
      throw {
        success: false,
        error: error.response?.data?.error || error.message,
        message: 'Erreur lors de la génération du mot de passe'
      }
    }
  }
}

// Service pour la génération de secrets 2FA
export const twoFactorGenerationService = {
  async generateTwoFactor(request: TwoFactorGenerationRequest): Promise<TwoFactorGenerationResponse> {
    try {
      const startTime = Date.now()
      
      const response = await serverlessApi.post(
        DEFAULT_CONFIG.functions.twoFactorGeneration.endpoint,
        request
      )
      
      const responseTime = Date.now() - startTime
      
      // Enregistrer l'appel
      await logFunctionCall({
        functionName: '2fa-generation',
        userId: request.userId,
        username: request.username,
        success: response.data.success || false,
        responseTime,
        timestamp: new Date(),
        ipAddress: '127.0.0.1'
      })
      
      return response.data
    } catch (error: any) {
      await logFunctionCall({
        functionName: '2fa-generation',
        userId: request.userId,
        username: request.username,
        success: false,
        responseTime: 0,
        timestamp: new Date(),
        error: error.message,
        ipAddress: '127.0.0.1'
      })
      
      throw {
        success: false,
        error: error.response?.data?.error || error.message,
        message: 'Erreur lors de la génération du secret 2FA'
      }
    }
  }
}

// Service pour l'authentification
export const authenticationService = {
  async authenticate(request: AuthenticationRequest): Promise<AuthenticationResponse> {
    try {
      const startTime = Date.now()
      
      const response = await serverlessApi.post(
        DEFAULT_CONFIG.functions.authentication.endpoint,
        request
      )
      
      const responseTime = Date.now() - startTime
      
      // Enregistrer l'appel
      await logFunctionCall({
        functionName: 'authentication',
        username: request.username,
        success: response.data.authenticated || false,
        responseTime,
        timestamp: new Date(),
        ipAddress: '127.0.0.1'
      })
      
      return response.data
    } catch (error: any) {
      await logFunctionCall({
        functionName: 'authentication',
        username: request.username,
        success: false,
        responseTime: 0,
        timestamp: new Date(),
        error: error.message,
        ipAddress: '127.0.0.1'
      })
      
      throw {
        success: false,
        authenticated: false,
        error: error.response?.data?.error || error.message,
        message: 'Erreur lors de l\'authentification'
      }
    }
  }
}

// Service pour les statistiques et monitoring
export const monitoringService = {
  async getStats(): Promise<DashboardStats> {
    // Pour l'instant, retourne des données mockées
    // À remplacer par de vraies statistiques basées sur les logs
    return {
      passwordGenerations: {
        total: 156,
        last24h: 12,
        successRate: 98.5
      },
      twoFactorGenerations: {
        total: 143,
        last24h: 11,
        successRate: 99.2
      },
      authentications: {
        total: 1247,
        successful: 1189,
        failed: 43,
        expired: 15,
        last24h: 89
      },
      functionsStatus: {
        passwordFunction: 'healthy',
        twoFactorFunction: 'healthy',
        authFunction: 'healthy'
      }
    }
  },

  async testFunction(functionName: string, payload: any): Promise<any> {
    const endpoints = {
      'password-generation': DEFAULT_CONFIG.functions.passwordGeneration.endpoint,
      '2fa-generation': DEFAULT_CONFIG.functions.twoFactorGeneration.endpoint,
      'authentication': DEFAULT_CONFIG.functions.authentication.endpoint
    }

    const endpoint = endpoints[functionName as keyof typeof endpoints]
    if (!endpoint) {
      throw new Error(`Fonction inconnue: ${functionName}`)
    }

    try {
      const startTime = Date.now()
      const response = await serverlessApi.post(endpoint, payload)
      const responseTime = Date.now() - startTime

      return {
        success: true,
        response: response.data,
        responseTime,
        timestamp: new Date()
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data || error.message,
        responseTime: 0,
        timestamp: new Date()
      }
    }
  }
}

// Service pour l'historique des appels (simulation locale)
let functionCalls: FunctionCall[] = []

async function logFunctionCall(call: Omit<FunctionCall, 'id'>): Promise<void> {
  const functionCall: FunctionCall = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...call
  }
  
  functionCalls.push(functionCall)
  
  // Garder seulement les 1000 derniers appels
  if (functionCalls.length > 1000) {
    functionCalls = functionCalls.slice(-1000)
  }
}

export const historyService = {
  getFunctionCalls(): FunctionCall[] {
    return functionCalls.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  },

  clearHistory(): void {
    functionCalls = []
  }
}

// Configuration et utilitaires
export const configService = {
  getConfig(): ServerlessConfig {
    return DEFAULT_CONFIG
  },

  updateConfig(newConfig: Partial<ServerlessConfig>): void {
    Object.assign(DEFAULT_CONFIG, newConfig)
    
    // Mettre à jour l'URL de base d'axios
    serverlessApi.defaults.baseURL = DEFAULT_CONFIG.baseUrl
  },

  async testConnection(): Promise<boolean> {
    try {
      // Test de connectivité avec l'endpoint de santé d'OpenFaaS
      await axios.get(`${DEFAULT_CONFIG.baseUrl}/system/functions`, { timeout: 5000 })
      return true
    } catch {
      return false
    }
  }
}

// Export par défaut
export default {
  passwordGeneration: passwordGenerationService,
  twoFactorGeneration: twoFactorGenerationService,
  authentication: authenticationService,
  monitoring: monitoringService,
  history: historyService,
  config: configService
} 