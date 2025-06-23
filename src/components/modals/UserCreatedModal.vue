<template>
  <!-- Overlay -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
          <!-- En-tête -->
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <CheckCircleIcon class="w-6 h-6 text-green-500 mr-2" />
                Utilisateur créé avec succès !
              </h3>
              <button
                @click="$emit('close')"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Fermer"
              >
                <XMarkIcon class="w-6 h-6" />
              </button>
            </div>
          </div>

          <!-- Contenu -->
          <div class="px-6 py-6 space-y-6">
            <!-- Informations utilisateur -->
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 dark:text-white mb-3">
                Informations de l'utilisateur
              </h4>
              <dl class="space-y-2">
                <div class="flex justify-between">
                  <dt class="text-sm text-gray-600 dark:text-gray-400">Nom :</dt>
                  <dd class="text-sm font-medium text-gray-900 dark:text-white">{{ user?.name }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-sm text-gray-600 dark:text-gray-400">Email :</dt>
                  <dd class="text-sm font-medium text-gray-900 dark:text-white">{{ user?.email }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-sm text-gray-600 dark:text-gray-400">Rôle :</dt>
                  <dd class="text-sm font-medium text-gray-900 dark:text-white">{{ roleText }}</dd>
                </div>
              </dl>
            </div>

            <!-- Révélation du mot de passe -->
            <div class="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
              <div class="flex items-start">
                <ExclamationTriangleIcon class="w-5 h-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
                <div class="flex-1">
                  <h4 class="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                    Mot de passe généré
                  </h4>
                  <p class="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                    Voici le mot de passe généré pour cet utilisateur. 
                    <strong>Conservez-le précieusement</strong>, il ne sera plus affiché.
                  </p>
                  
                  <!-- Reveal Component pour éviter CLS -->
                  <div class="relative">
                    <div 
                      class="bg-white dark:bg-gray-800 border border-yellow-300 dark:border-yellow-600 rounded-lg p-3 font-mono text-sm transition-all duration-200"
                      :class="{ 'filter blur-sm': !isPasswordRevealed }"
                    >
                      {{ password }}
                    </div>
                    
                    <!-- Overlay de révélation -->
                    <div 
                      v-if="!isPasswordRevealed"
                      class="absolute inset-0 flex items-center justify-center bg-yellow-100 dark:bg-yellow-800 bg-opacity-90 rounded-lg cursor-pointer"
                      @click="revealPassword"
                    >
                      <div class="text-center">
                        <EyeIcon class="w-6 h-6 text-yellow-600 dark:text-yellow-400 mx-auto mb-1" />
                        <span class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          Cliquer pour révéler
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Actions mot de passe -->
                  <div v-if="isPasswordRevealed" class="mt-3 flex items-center space-x-3">
                    <button
                      @click="copyPassword"
                      class="text-sm text-yellow-700 dark:text-yellow-300 hover:text-yellow-800 dark:hover:text-yellow-200 flex items-center transition-colors"
                    >
                      <ClipboardIcon class="w-4 h-4 mr-1" />
                      {{ passwordCopied ? 'Copié !' : 'Copier' }}
                    </button>
                    <button
                      @click="hidePassword"
                      class="text-sm text-yellow-700 dark:text-yellow-300 hover:text-yellow-800 dark:hover:text-yellow-200 flex items-center transition-colors"
                    >
                      <EyeSlashIcon class="w-4 h-4 mr-1" />
                      Masquer
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- QR Code -->
            <div v-if="qrCode" class="text-center">
              <h4 class="font-medium text-gray-900 dark:text-white mb-3">
                QR Code d'authentification
              </h4>
              <div class="inline-block p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <img
                  :src="qrCode"
                  alt="QR Code login user"
                  class="w-48 h-48 mx-auto"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Scannez ce code pour une connexion rapide
              </p>
            </div>

            <!-- Instructions -->
            <div class="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <div class="flex items-start">
                <InformationCircleIcon class="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 class="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Prochaines étapes
                  </h4>
                  <ul class="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Transmettez ces informations à l'utilisateur de manière sécurisée</li>
                    <li>• L'utilisateur devra changer son mot de passe lors de sa première connexion</li>
                    <li>• Le QR code peut être utilisé pour une authentification rapide</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Pied de page -->
          <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-2xl">
            <div class="flex items-center justify-between">
              <button
                @click="downloadCredentials"
                class="btn-secondary text-sm"
              >
                <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
                Télécharger les informations
              </button>
              <button
                @click="$emit('close')"
                class="btn-primary"
              >
                Terminer
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  CheckCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  ClipboardIcon,
  InformationCircleIcon,
  ArrowDownTrayIcon,
} from '@heroicons/vue/24/outline'
import { toast } from 'vue-sonner'
import type { User } from '@/types'

interface Props {
  user: User | null
  password: string
  qrCode?: string
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

// État de révélation du mot de passe
const isPasswordRevealed = ref(false)
const passwordCopied = ref(false)

// Texte du rôle localisé
const roleText = computed(() => {
  const roleTexts = {
    admin: 'Administrateur',
    moderator: 'Modérateur',
    user: 'Utilisateur',
  }
  return roleTexts[props.user?.role || 'user'] || 'Utilisateur'
})

// Révéler le mot de passe
const revealPassword = () => {
  isPasswordRevealed.value = true
}

// Masquer le mot de passe
const hidePassword = () => {
  isPasswordRevealed.value = false
  passwordCopied.value = false
}

// Copier le mot de passe
const copyPassword = async () => {
  try {
    await navigator.clipboard.writeText(props.password)
    passwordCopied.value = true
    toast.success('Mot de passe copié dans le presse-papiers')
    
    // Réinitialiser l'état après 3 secondes
    setTimeout(() => {
      passwordCopied.value = false
    }, 3000)
  } catch (error) {
    toast.error('Impossible de copier le mot de passe')
  }
}

// Télécharger les informations d'identification
const downloadCredentials = () => {
  if (!props.user) return

  const credentials = {
    name: props.user.name,
    email: props.user.email,
    role: props.user.role,
    password: props.password,
    createdAt: new Date().toISOString(),
    instructions: [
      'Conservez ces informations dans un endroit sécurisé',
      'Changez votre mot de passe lors de votre première connexion',
      'Ne partagez jamais votre mot de passe',
    ],
  }

  const dataStr = JSON.stringify(credentials, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `credentials-${props.user.email}-${Date.now()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  toast.success('Informations d\'identification téléchargées')
}
</script> 