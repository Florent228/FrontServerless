<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- En-tête avec navigation -->
    <div class="mb-8">
      <nav class="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
        <RouterLink to="/" class="hover:text-primary transition-colors">Dashboard</RouterLink>
        <ChevronRightIcon class="w-4 h-4" />
        <span class="text-gray-900 dark:text-white">Détail utilisateur</span>
      </nav>
      
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ currentUser?.name || 'Chargement...' }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            {{ currentUser?.email }}
          </p>
        </div>
        
        <!-- Actions rapides -->
        <div class="flex items-center space-x-3">
          <button
            @click="openActionDrawer('edit')"
            class="btn-secondary"
          >
            <PencilIcon class="w-4 h-4 mr-2" />
            Modifier
          </button>
          <button
            @click="openActionDrawer('delete')"
            class="btn-danger"
          >
            <TrashIcon class="w-4 h-4 mr-2" />
            Supprimer
          </button>
        </div>
      </div>
    </div>

    <!-- État de chargement -->
    <div v-if="store.loading" class="animate-pulse">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6">
          <div class="card p-6">
            <div class="w-32 h-6 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
            <div class="space-y-3">
              <div v-for="i in 4" :key="i" class="flex justify-between">
                <div class="w-20 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div class="w-32 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <div v-else-if="currentUser" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Informations principales -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Profil utilisateur -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Informations du profil
          </h2>
          
          <div class="flex items-start space-x-6">
            <!-- Avatar -->
            <div class="flex-shrink-0">
              <img
                v-if="currentUser.avatar"
                :src="currentUser.avatar"
                :alt="`Avatar de ${currentUser.name}`"
                class="h-24 w-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg"
                loading="lazy"
                decoding="async"
              />
              <div v-else class="h-24 w-24 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-lg">
                <span class="text-2xl font-bold text-gray-700 dark:text-gray-300">
                  {{ userInitials }}
                </span>
              </div>
            </div>

            <!-- Informations -->
            <div class="flex-1 space-y-4">
              <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Nom complet</dt>
                  <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ currentUser.name }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                  <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ currentUser.email }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Rôle</dt>
                  <dd class="mt-1">
                    <span 
                      class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                      :class="roleClasses"
                    >
                      {{ roleText }}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Statut</dt>
                  <dd class="mt-1">
                    <span 
                      class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full"
                      :class="statusClasses"
                    >
                      <span 
                        class="w-1.5 h-1.5 rounded-full mr-1.5"
                        :class="statusDotClasses"
                      ></span>
                      {{ currentUser.active ? 'Actif' : 'Inactif' }}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Créé le</dt>
                  <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                    {{ formatDate(currentUser.createdAt) }}
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Dernière connexion</dt>
                  <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                    {{ currentUser.lastLogin ? formatDate(currentUser.lastLogin) : 'Jamais' }}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <!-- Historique d'activité -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Historique d'activité
          </h2>
          
          <div class="space-y-4">
            <div v-for="activity in mockActivities" :key="activity.id" 
                 class="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div 
                class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                :class="getActivityIconClasses(activity.type)"
              >
                <component :is="getActivityIcon(activity.type)" class="w-4 h-4" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-900 dark:text-white">
                  {{ activity.description }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatDate(activity.timestamp) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar actions -->
      <div class="space-y-6">
        <!-- Actions rapides -->
        <div class="card p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Actions
          </h3>
          
          <div class="space-y-3">
            <button
              @click="toggleUserStatus"
              :disabled="isToggling"
              class="w-full btn-secondary text-left justify-start"
            >
              <component 
                :is="currentUser.active ? PauseIcon : PlayIcon" 
                class="w-4 h-4 mr-2" 
              />
              {{ currentUser.active ? 'Désactiver' : 'Activer' }}
              <div v-if="isToggling" class="ml-auto">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
              </div>
            </button>
            
            <button
              @click="resetPassword"
              class="w-full btn-secondary text-left justify-start"
            >
              <KeyIcon class="w-4 h-4 mr-2" />
              Réinitialiser mot de passe
            </button>
            
            <button
              @click="openActionDrawer('permissions')"
              class="w-full btn-secondary text-left justify-start"
            >
              <ShieldCheckIcon class="w-4 h-4 mr-2" />
              Gérer permissions
            </button>
          </div>
        </div>

        <!-- Statistiques -->
        <div class="card p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Statistiques
          </h3>
          
          <div class="space-y-4">
            <div class="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {{ mockStats.totalLogins }}
              </div>
              <div class="text-sm text-blue-700 dark:text-blue-300">
                Connexions totales
              </div>
            </div>
            
            <div class="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg">
              <div class="text-2xl font-bold text-green-600 dark:text-green-400">
                {{ mockStats.lastActivityDays }}j
              </div>
              <div class="text-sm text-green-700 dark:text-green-300">
                Dernière activité
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- État d'erreur -->
    <div v-else-if="store.error" class="text-center py-12">
      <ExclamationTriangleIcon class="mx-auto h-12 w-12 text-red-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
        Erreur de chargement
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ store.error }}
      </p>
      <div class="mt-6">
        <button @click="loadUser" class="btn-primary">
          Réessayer
        </button>
      </div>
    </div>

    <!-- Action Drawer -->
    <ActionDrawer
      v-if="showActionDrawer"
      :type="currentAction"
      :user="currentUser"
      @close="closeActionDrawer"
      @confirm="handleActionConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
  ChevronRightIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  PauseIcon,
  PlayIcon,
  KeyIcon,
  ShieldCheckIcon,
  LoginIcon,
  CogIcon,
  UserIcon,
} from '@heroicons/vue/24/outline'
import { toast } from 'vue-sonner'
import { useMainStore } from '@/stores'
import ActionDrawer from '@/components/modals/ActionDrawer.vue'
import type { User } from '@/types'

// Props et router
const route = useRoute()
const router = useRouter()
const store = useMainStore()

// État local
const showActionDrawer = ref(false)
const currentAction = ref<'edit' | 'delete' | 'permissions'>('edit')
const isToggling = ref(false)

// Utilisateur actuel
const currentUser = computed(() => store.currentUser)

// Données mockées pour la démo
const mockActivities = ref([
  {
    id: '1',
    type: 'login',
    description: 'Connexion depuis Chrome (192.168.1.100)',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    type: 'update',
    description: 'Profil mis à jour',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    type: 'permission',
    description: 'Permissions modifiées par admin',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
])

const mockStats = ref({
  totalLogins: 156,
  lastActivityDays: 2,
})

// Computed properties
const userInitials = computed(() => {
  if (!currentUser.value) return ''
  return currentUser.value.name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
})

const roleClasses = computed(() => {
  if (!currentUser.value) return ''
  const roleColors = {
    admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    moderator: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    user: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  }
  return roleColors[currentUser.value.role] || roleColors.user
})

const roleText = computed(() => {
  if (!currentUser.value) return ''
  const roleTexts = {
    admin: 'Administrateur',
    moderator: 'Modérateur',
    user: 'Utilisateur',
  }
  return roleTexts[currentUser.value.role] || 'Utilisateur'
})

const statusClasses = computed(() => {
  if (!currentUser.value) return ''
  return currentUser.value.active
    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
})

const statusDotClasses = computed(() => {
  if (!currentUser.value) return ''
  return currentUser.value.active ? 'bg-green-400' : 'bg-gray-400'
})

// Méthodes
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getActivityIcon = (type: string) => {
  const icons = {
    login: LoginIcon,
    update: CogIcon,
    permission: ShieldCheckIcon,
  }
  return icons[type as keyof typeof icons] || UserIcon
}

const getActivityIconClasses = (type: string) => {
  const classes = {
    login: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
    update: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
    permission: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
  }
  return classes[type as keyof typeof classes] || 'bg-gray-100 text-gray-600'
}

const loadUser = async () => {
  const userId = route.params.id as string
  if (userId) {
    try {
      await store.fetchUser(userId)
    } catch (error) {
      console.error('Erreur chargement utilisateur:', error)
    }
  }
}

const openActionDrawer = (action: 'edit' | 'delete' | 'permissions') => {
  currentAction.value = action
  showActionDrawer.value = true
}

const closeActionDrawer = () => {
  showActionDrawer.value = false
}

const handleActionConfirm = async (data: any) => {
  try {
    switch (currentAction.value) {
      case 'delete':
        // Optimistic UI : naviguer immédiatement
        router.push('/')
        await store.deleteUser(currentUser.value!.id)
        toast.success('Utilisateur supprimé')
        break
        
      case 'edit':
        // Mettre à jour les données
        Object.assign(currentUser.value!, data)
        toast.success('Utilisateur mis à jour')
        break
        
      case 'permissions':
        toast.success('Permissions mises à jour')
        break
    }
  } catch (error) {
    toast.error('Erreur lors de l\'action')
    // En cas d'erreur de suppression, recharger la page
    if (currentAction.value === 'delete') {
      await loadUser()
    }
  } finally {
    closeActionDrawer()
  }
}

const toggleUserStatus = async () => {
  if (!currentUser.value) return
  
  try {
    isToggling.value = true
    const previousStatus = currentUser.value.active
    
    // Optimistic UI
    currentUser.value.active = !currentUser.value.active
    
    // Appel API simulé
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast.success(
      currentUser.value.active 
        ? 'Utilisateur activé' 
        : 'Utilisateur désactivé'
    )
  } catch (error) {
    // Revert optimistic change
    if (currentUser.value) {
      currentUser.value.active = !currentUser.value.active
    }
    toast.error('Erreur lors du changement de statut')
  } finally {
    isToggling.value = false
  }
}

const resetPassword = () => {
  toast.success('Email de réinitialisation envoyé')
}

// Chargement initial
onMounted(() => {
  loadUser()
})
</script> 