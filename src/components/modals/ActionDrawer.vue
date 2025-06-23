<template>
  <!-- Overlay -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div class="fixed inset-0 z-40 bg-black bg-opacity-50" @click="$emit('close')" />
    </Transition>

    <!-- Drawer -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-x-full"
      enter-to-class="transform translate-x-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-x-0"
      leave-to-class="transform translate-x-full"
    >
      <div class="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-gray-800 shadow-xl border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
        <!-- En-tête avec focus trap -->
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ drawerTitle }}
            </h2>
            <button
              ref="closeButton"
              @click="$emit('close')"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 rounded-lg focus:ring-2 focus:ring-primary"
              aria-label="Fermer"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>

        <!-- Contenu selon le type d'action -->
        <div class="px-6 py-6">
          <!-- Action: Modifier -->
          <form v-if="type === 'edit'" @submit.prevent="handleSubmit" class="space-y-6">
            <div>
              <label for="edit-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom complet
              </label>
              <input
                id="edit-name"
                v-model="editForm.name"
                type="text"
                class="input"
                required
              />
            </div>

            <div>
              <label for="edit-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                id="edit-email"
                v-model="editForm.email"
                type="email"
                class="input"
                required
              />
            </div>

            <div>
              <label for="edit-role" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rôle
              </label>
              <select
                id="edit-role"
                v-model="editForm.role"
                class="input"
                required
              >
                <option value="user">Utilisateur</option>
                <option value="moderator">Modérateur</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>

            <div class="flex items-center">
              <input
                id="edit-active"
                v-model="editForm.active"
                type="checkbox"
                class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label for="edit-active" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Compte actif
              </label>
            </div>

            <div class="flex space-x-3 pt-6">
              <button
                type="button"
                @click="$emit('close')"
                class="flex-1 btn-secondary"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="flex-1 btn-primary relative"
              >
                <span v-if="!isSubmitting">Enregistrer</span>
                <span v-else class="flex items-center justify-center">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enregistrement...
                </span>
              </button>
            </div>
          </form>

          <!-- Action: Supprimer -->
          <div v-else-if="type === 'delete'" class="space-y-6">
            <div class="text-center">
              <ExclamationTriangleIcon class="mx-auto h-12 w-12 text-red-400" />
              <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                Supprimer l'utilisateur
              </h3>
              <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Êtes-vous sûr de vouloir supprimer <strong>{{ user?.name }}</strong> ?
                Cette action est irréversible.
              </p>
            </div>

            <div class="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <div class="flex">
                <ExclamationTriangleIcon class="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                <div class="text-sm text-red-700 dark:text-red-300">
                  <h4 class="font-medium mb-1">Conséquences de la suppression :</h4>
                  <ul class="list-disc list-inside space-y-1">
                    <li>Toutes les données utilisateur seront perdues</li>
                    <li>L'accès aux ressources sera immédiatement révoqué</li>
                    <li>Les journaux d'audit seront conservés</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Confirmation par saisie -->
            <div>
              <label for="delete-confirm" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tapez "SUPPRIMER" pour confirmer
              </label>
              <input
                id="delete-confirm"
                v-model="deleteConfirmation"
                type="text"
                class="input"
                :class="{ 'input-error': deleteConfirmation && deleteConfirmation !== 'SUPPRIMER' }"
                placeholder="SUPPRIMER"
              />
            </div>

            <div class="flex space-x-3">
              <button
                type="button"
                @click="$emit('close')"
                class="flex-1 btn-secondary"
              >
                Annuler
              </button>
              <button
                @click="confirmDelete"
                :disabled="deleteConfirmation !== 'SUPPRIMER' || isSubmitting"
                class="flex-1 btn-danger relative"
              >
                <span v-if="!isSubmitting">Supprimer définitivement</span>
                <span v-else class="flex items-center justify-center">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Suppression...
                </span>
              </button>
            </div>
          </div>

          <!-- Action: Permissions -->
          <div v-else-if="type === 'permissions'" class="space-y-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Gérer les permissions
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Configurez les accès et permissions pour cet utilisateur.
              </p>
            </div>

            <div class="space-y-4">
              <div v-for="permission in permissions" :key="permission.id" 
                   class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div class="flex-1">
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ permission.name }}
                  </h4>
                  <p class="text-xs text-gray-600 dark:text-gray-400">
                    {{ permission.description }}
                  </p>
                </div>
                <div class="ml-4">
                  <button
                    @click="togglePermission(permission.id)"
                    :class="[
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      permission.granted 
                        ? 'bg-primary' 
                        : 'bg-gray-200 dark:bg-gray-600'
                    ]"
                    role="switch"
                    :aria-checked="permission.granted"
                  >
                    <span
                      :class="[
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        permission.granted ? 'translate-x-6' : 'translate-x-1'
                      ]"
                    />
                  </button>
                </div>
              </div>
            </div>

            <div class="flex space-x-3 pt-6">
              <button
                type="button"
                @click="$emit('close')"
                class="flex-1 btn-secondary"
              >
                Annuler
              </button>
              <button
                @click="savePermissions"
                :disabled="isSubmitting"
                class="flex-1 btn-primary relative"
              >
                <span v-if="!isSubmitting">Enregistrer</span>
                <span v-else class="flex items-center justify-center">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enregistrement...
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import type { User } from '@/types'

interface Props {
  type: 'edit' | 'delete' | 'permissions'
  user: User | null
}

interface Emits {
  (e: 'close'): void
  (e: 'confirm', data: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Refs et état
const closeButton = ref<HTMLElement>()
const isSubmitting = ref(false)
const deleteConfirmation = ref('')

// Formulaire d'édition
const editForm = reactive({
  name: '',
  email: '',
  role: 'user' as 'user' | 'moderator' | 'admin',
  active: true,
})

// Permissions mockées
const permissions = ref([
  {
    id: 'read_users',
    name: 'Lecture utilisateurs',
    description: 'Consulter la liste des utilisateurs',
    granted: true,
  },
  {
    id: 'create_users',
    name: 'Créer utilisateurs',
    description: 'Ajouter de nouveaux utilisateurs',
    granted: false,
  },
  {
    id: 'edit_users',
    name: 'Modifier utilisateurs',
    description: 'Éditer les informations utilisateurs',
    granted: false,
  },
  {
    id: 'delete_users',
    name: 'Supprimer utilisateurs',
    description: 'Supprimer des utilisateurs',
    granted: false,
  },
  {
    id: 'manage_permissions',
    name: 'Gérer permissions',
    description: 'Modifier les permissions d\'autres utilisateurs',
    granted: false,
  },
])

// Computed
const drawerTitle = computed(() => {
  const titles = {
    edit: 'Modifier l\'utilisateur',
    delete: 'Supprimer l\'utilisateur',
    permissions: 'Gérer les permissions',
  }
  return titles[props.type]
})

// Méthodes
const handleSubmit = async () => {
  try {
    isSubmitting.value = true
    
    // Simulation d'appel API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    emit('confirm', editForm)
  } catch (error) {
    console.error('Erreur sauvegarde:', error)
  } finally {
    isSubmitting.value = false
  }
}

const confirmDelete = async () => {
  try {
    isSubmitting.value = true
    
    // Simulation d'appel API
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    emit('confirm', { action: 'delete' })
  } catch (error) {
    console.error('Erreur suppression:', error)
  } finally {
    isSubmitting.value = false
  }
}

const togglePermission = (permissionId: string) => {
  const permission = permissions.value.find(p => p.id === permissionId)
  if (permission) {
    permission.granted = !permission.granted
  }
}

const savePermissions = async () => {
  try {
    isSubmitting.value = true
    
    // Simulation d'appel API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    emit('confirm', { 
      action: 'permissions', 
      permissions: permissions.value.filter(p => p.granted).map(p => p.id)
    })
  } catch (error) {
    console.error('Erreur permissions:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Focus management pour l'accessibilité
onMounted(async () => {
  // Initialiser le formulaire avec les données utilisateur
  if (props.user && props.type === 'edit') {
    Object.assign(editForm, {
      name: props.user.name,
      email: props.user.email,
      role: props.user.role,
      active: props.user.active,
    })
  }

  // Focus sur le bouton de fermeture pour l'accessibilité
  await nextTick()
  closeButton.value?.focus()
})

// Gestion clavier
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script> 