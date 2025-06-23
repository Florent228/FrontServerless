import axios, { type AxiosResponse, type AxiosError } from 'axios'
import axiosRetry from 'axios-retry'
import { toast } from 'vue-sonner'
import { useMainStore } from '@/stores'

// Configuration de l'instance Axios principale
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Configuration des retry
axiosRetry(api, {
  retries: 2,
  retryDelay: (retryCount) => {
    return retryCount * 1000 // 1s, 2s
  },
  retryCondition: (error) => {
    // Retry sur les erreurs réseau ou 5xx
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
           (error.response?.status !== undefined && error.response.status >= 500)
  },
})

// Configuration des intercepteurs
export const setupAxios = () => {
  // Intercepteur de requête
  api.interceptors.request.use(
    (config) => {
      // Ajouter le token d'authentification si disponible
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      // Démarrer le loading dans le store si défini
      try {
        const store = useMainStore()
        store.setLoading(true)
      } catch {
        // Store pas encore initialisé, ignorer
      }

      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Intercepteur de réponse
  api.interceptors.response.use(
    (response: AxiosResponse) => {
      // Arrêter le loading
      try {
        const store = useMainStore()
        store.setLoading(false)
      } catch {
        // Store pas encore initialisé, ignorer
      }

      return response
    },
    (error: AxiosError) => {
      // Arrêter le loading
      try {
        const store = useMainStore()
        store.setLoading(false)
      } catch {
        // Store pas encore initialisé, ignorer
      }

      // Gestion des erreurs globales
      if (error.response) {
        const status = error.response.status
        const data = error.response.data as any

        switch (status) {
          case 401:
            // Token expiré ou invalide
            localStorage.removeItem('auth_token')
            toast.error('Session expirée', {
              description: 'Veuillez vous reconnecter',
            })
            // Rediriger vers la page de connexion si nécessaire
            break

          case 403:
            toast.error('Accès refusé', {
              description: 'Vous n\'avez pas les permissions nécessaires',
            })
            break

          case 404:
            toast.error('Ressource non trouvée', {
              description: data?.message || 'La ressource demandée n\'existe pas',
            })
            break

          case 422:
            // Erreurs de validation
            toast.error('Erreur de validation', {
              description: data?.message || 'Veuillez vérifier les données saisies',
            })
            break

          case 429:
            toast.error('Trop de requêtes', {
              description: 'Veuillez patienter avant de réessayer',
            })
            break

          case 500:
          case 502:
          case 503:
          case 504:
            toast.error('Erreur serveur', {
              description: 'Un problème est survenu côté serveur',
            })
            break

          default:
            toast.error('Erreur', {
              description: data?.message || 'Une erreur inattendue s\'est produite',
            })
        }
      } else if (error.request) {
        // Erreur de réseau
        toast.error('Erreur de connexion', {
          description: 'Impossible de contacter le serveur',
        })
      }

      return Promise.reject(error)
    }
  )
}

// Helper pour les requêtes avec gestion d'erreur personnalisée
export const apiRequest = async <T>(
  request: () => Promise<AxiosResponse<T>>,
  options?: {
    successMessage?: string
    errorMessage?: string
    showLoading?: boolean
  }
) => {
  try {
    const response = await request()
    
    if (options?.successMessage) {
      toast.success(options.successMessage)
    }
    
    return response.data
  } catch (error) {
    if (options?.errorMessage) {
      toast.error(options.errorMessage)
    }
    throw error
  }
} 