<template>
  <div>
    <!-- Modal d'aide raccourcis clavier -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div v-if="showHelp" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full border border-gray-200 dark:border-gray-700">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Raccourcis clavier
                </h3>
                <button
                  @click="showHelp = false"
                  class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon class="w-6 h-6" />
                </button>
              </div>
            </div>

            <div class="px-6 py-4 space-y-4">
              <div
                v-for="shortcut in shortcuts"
                :key="shortcut.keys"
                class="flex items-center justify-between"
              >
                <span class="text-sm text-gray-700 dark:text-gray-300">
                  {{ shortcut.description }}
                </span>
                <div class="flex items-center space-x-1">
                  <kbd
                    v-for="key in shortcut.keys.split(' + ')"
                    :key="key"
                    class="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600"
                  >
                    {{ key }}
                  </kbd>
                </div>
              </div>
            </div>

            <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-2xl">
              <p class="text-xs text-gray-600 dark:text-gray-400">
                Appuyez sur <kbd class="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">?</kbd> 
                pour afficher cette aide
              </p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMagicKeys } from '@vueuse/core'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { toast } from 'vue-sonner'

const router = useRouter()
const showHelp = ref(false)

// Configuration des raccourcis
const shortcuts = [
  { keys: 'g + d', description: 'Aller au Dashboard' },
  { keys: 'g + c', description: 'Créer un utilisateur' },
  { keys: 'g + a', description: 'Test d\'authentification' },
  { keys: 'g + l', description: 'Journal d\'audit' },
  { keys: '?', description: 'Afficher cette aide' },
  { keys: 'Échap', description: 'Fermer les modales' },
  { keys: 't', description: 'Basculer le thème' },
  { keys: 'r', description: 'Actualiser les données' },
]

// Utilisation de VueUse pour les raccourcis
const keys = useMagicKeys()

// Navigation shortcuts
const { g, d, c, a, l, t, r, escape, shift_slash } = keys

// Mode séquentiel pour 'g' suivi d'une autre touche
let isGPressed = false
let gTimeout: number | null = null

const handleKeydown = (event: KeyboardEvent) => {
  // Ignorer si on est dans un input
  if (event.target instanceof HTMLElement) {
    const tagName = event.target.tagName.toLowerCase()
    if (['input', 'textarea', 'select'].includes(tagName) || event.target.contentEditable === 'true') {
      return
    }
  }

  const key = event.key.toLowerCase()

  // Gérer les séquences avec 'g'
  if (key === 'g') {
    event.preventDefault()
    isGPressed = true
    
    // Reset après 2 secondes
    if (gTimeout) clearTimeout(gTimeout)
    gTimeout = window.setTimeout(() => {
      isGPressed = false
    }, 2000)
    
    toast('Navigation: g + ?', { duration: 1000 })
    return
  }

  // Actions avec 'g' + touche
  if (isGPressed) {
    event.preventDefault()
    isGPressed = false
    if (gTimeout) clearTimeout(gTimeout)

    switch (key) {
      case 'd':
        router.push('/')
        toast.success('Dashboard')
        break
      case 'c':
        router.push('/create-user')
        toast.success('Créer utilisateur')
        break
      case 'a':
        router.push('/auth-test')
        toast.success('Test authentification')
        break
      case 'l':
        router.push('/audit-log')
        toast.success('Journal audit')
        break
    }
    return
  }

  // Actions directes
  switch (key) {
    case '?':
      event.preventDefault()
      showHelp.value = !showHelp.value
      break
    case 'escape':
      showHelp.value = false
      // Fermer autres modales si nécessaire
      break
    case 't':
      if (!event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        // Basculer le thème (sera implémenté via un event bus ou store)
        document.dispatchEvent(new CustomEvent('toggle-theme'))
      }
      break
    case 'r':
      if (!event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        // Actualiser les données
        document.dispatchEvent(new CustomEvent('refresh-data'))
      }
      break
  }
}

// Écouter les événements personnalisés pour les raccourcis
const handleToggleTheme = () => {
  // Émet un événement que le composant parent peut écouter
  document.dispatchEvent(new CustomEvent('keyboard-toggle-theme'))
}

const handleRefreshData = () => {
  document.dispatchEvent(new CustomEvent('keyboard-refresh-data'))
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('toggle-theme', handleToggleTheme)
  document.addEventListener('refresh-data', handleRefreshData)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('toggle-theme', handleToggleTheme)
  document.removeEventListener('refresh-data', handleRefreshData)
  if (gTimeout) clearTimeout(gTimeout)
})
</script> 