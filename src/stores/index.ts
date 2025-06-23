import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, ApiResponse, KPIData } from '@/types'
import { api } from '@/plugins/axios'

export const useMainStore = defineStore('main', () => {
  // État
  const users = ref<User[]>([])
  const currentUser = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const kpiData = ref<KPIData | null>(null)

  // Getters
  const userCount = computed(() => users.value.length)
  const activeUsers = computed(() => users.value.filter(user => user.active))
  const activeUserCount = computed(() => activeUsers.value.length)

  // Actions
  const setLoading = (state: boolean) => {
    loading.value = state
  }

  const setError = (message: string | null) => {
    error.value = message
  }

  const clearError = () => {
    error.value = null
  }

  // Récupérer tous les utilisateurs
  const fetchUsers = async () => {
    try {
      setLoading(true)
      clearError()
      
      const response = await api.get<ApiResponse<User[]>>('/api/users')
      users.value = response.data.data || []
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des utilisateurs')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Récupérer un utilisateur par ID
  const fetchUser = async (id: string) => {
    try {
      setLoading(true)
      clearError()
      
      const response = await api.get<ApiResponse<User>>(`/api/users/${id}`)
      currentUser.value = response.data.data
      return currentUser.value
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération de l\'utilisateur')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Créer un utilisateur
  const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true)
      clearError()
      
      const response = await api.post<ApiResponse<User>>('/api/users', userData)
      const newUser = response.data.data
      users.value.unshift(newUser)
      return newUser
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création de l\'utilisateur')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Supprimer un utilisateur (avec optimistic UI)
  const deleteUser = async (id: string) => {
    const userIndex = users.value.findIndex(user => user.id === id)
    const userBackup = users.value[userIndex]

    try {
      // Optimistic UI : supprimer immédiatement de l'interface
      if (userIndex !== -1) {
        users.value.splice(userIndex, 1)
      }

      await api.delete(`/api/users/${id}`)
      
      // Si l'utilisateur actuel était celui supprimé, le réinitialiser
      if (currentUser.value?.id === id) {
        currentUser.value = null
      }
    } catch (err: any) {
      // Revert optimistic UI en cas d'erreur
      if (userBackup && userIndex !== -1) {
        users.value.splice(userIndex, 0, userBackup)
      }
      setError(err.response?.data?.message || 'Erreur lors de la suppression de l\'utilisateur')
      throw err
    }
  }

  // Récupérer les données KPI
  const fetchKPIData = async () => {
    try {
      setLoading(true)
      clearError()
      
      const response = await api.get<ApiResponse<KPIData>>('/api/kpi')
      kpiData.value = response.data.data
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des KPI')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    // État
    users,
    currentUser,
    loading,
    error,
    kpiData,
    
    // Getters
    userCount,
    activeUsers,
    activeUserCount,
    
    // Actions
    setLoading,
    setError,
    clearError,
    fetchUsers,
    fetchUser,
    createUser,
    deleteUser,
    fetchKPIData,
  }
}) 