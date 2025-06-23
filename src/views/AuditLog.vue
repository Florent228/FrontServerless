<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- En-tête -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Journal d'audit des fonctions serverless
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          Consultez l'historique des appels aux fonctions OpenFaaS
        </p>
      </div>

      <!-- Filtres -->
      <div class="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Filtre par utilisateur -->
          <div>
            <label for="user-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Utilisateur
            </label>
            <select
              id="user-filter"
              v-model="filters.user"
              class="input"
            >
              <option value="">Tous les utilisateurs</option>
              <option v-for="user in users" :key="user.id" :value="user.id">
                {{ user.name }}
              </option>
            </select>
          </div>

          <!-- Filtre par fonction -->
          <div>
            <label for="function-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fonction
            </label>
            <select
              id="function-filter"
              v-model="filters.functionName"
              class="input"
            >
              <option value="">Toutes les fonctions</option>
              <option value="password-generator">Génération mot de passe</option>
              <option value="2fa-generator">Génération 2FA</option>
              <option value="user-auth">Authentification</option>
            </select>
          </div>

          <!-- Filtre par date -->
          <div>
            <label for="date-from" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              À partir du
            </label>
            <input
              id="date-from"
              v-model="filters.dateFrom"
              type="date"
              class="input"
            />
          </div>

          <div>
            <label for="date-to" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Jusqu'au
            </label>
            <input
              id="date-to"
              v-model="filters.dateTo"
              type="date"
              class="input"
            />
          </div>
        </div>

        <!-- Boutons d'action -->
        <div class="flex justify-between items-center mt-6">
          <button
            @click="resetFilters"
            class="btn-secondary"
          >
            Réinitialiser
          </button>
          
          <div class="flex space-x-3">
            <button
              @click="exportAuditLog"
              class="btn-secondary"
            >
              <DocumentArrowDownIcon class="w-4 h-4 mr-2" />
              Exporter
            </button>
            <button
              @click="refreshLogs"
              :disabled="isLoading"
              class="btn-primary"
            >
              <ArrowPathIcon class="w-4 h-4 mr-2" :class="{ 'animate-spin': isLoading }" />
              Actualiser
            </button>
          </div>
        </div>
      </div>

      <!-- Liste des logs -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <!-- En-tête du tableau -->
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">
              Appels de fonctions ({{ filteredLogs.length }})
            </h2>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              Dernière mise à jour : {{ lastUpdate }}
            </div>
          </div>
        </div>

        <!-- Table normale pour toutes les entrées -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date & Heure
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Fonction
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Statut
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Temps réponse
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  IP
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="call in paginatedLogs" :key="call.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ formatDateTime(call.timestamp) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {{ getFunctionLabel(call.functionName) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ call.username || 'Anonyme' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    :class="call.success 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'"
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  >
                    {{ call.success ? 'Succès' : 'Échec' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ call.responseTime }}ms
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ call.ipAddress }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- État vide -->
        <div v-if="filteredLogs.length === 0" class="text-center py-12">
          <ClipboardDocumentListIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            Aucun appel de fonction trouvé
          </h3>
          <p class="mt-2 text-gray-600 dark:text-gray-400">
            Aucun appel de fonction serverless ne correspond aux critères sélectionnés.
          </p>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700 dark:text-gray-300">
              Page {{ currentPage }} sur {{ totalPages }}
            </div>
            <div class="flex space-x-2">
              <button
                @click="currentPage--"
                :disabled="currentPage === 1"
                class="btn-secondary disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                @click="currentPage++"
                :disabled="currentPage === totalPages"
                class="btn-secondary disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { DocumentArrowDownIcon, ArrowPathIcon, ClipboardDocumentListIcon } from '@heroicons/vue/24/outline'
import { useMainStore } from '@/stores'
import type { FunctionCall } from '@/types'

const store = useMainStore()

// État
const isLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const lastUpdate = ref(new Date().toLocaleString())

// Filtres
const filters = ref({
  user: '',
  functionName: '',
  dateFrom: '',
  dateTo: '',
})

// Utilisateurs pour les filtres
const users = ref([
  { id: 'admin', name: 'Administrateur' },
  { id: 'user1', name: 'Jean Dupont' },
  { id: 'user2', name: 'Marie Martin' },
])

// Computed
const filteredLogs = computed(() => {
  let filtered = store.functionCalls || []

  if (filters.value.user) {
    filtered = filtered.filter(call => call.username?.includes(filters.value.user))
  }

  if (filters.value.functionName) {
    filtered = filtered.filter(call => call.functionName === filters.value.functionName)
  }

  if (filters.value.dateFrom) {
    const fromDate = new Date(filters.value.dateFrom)
    filtered = filtered.filter(call => new Date(call.timestamp) >= fromDate)
  }

  if (filters.value.dateTo) {
    const toDate = new Date(filters.value.dateTo)
    toDate.setHours(23, 59, 59, 999)
    filtered = filtered.filter(call => new Date(call.timestamp) <= toDate)
  }

  return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
})

const totalPages = computed(() => Math.ceil(filteredLogs.value.length / pageSize.value))

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredLogs.value.slice(start, end)
})

// Méthodes
const resetFilters = () => {
  filters.value = {
    user: '',
    functionName: '',
    dateFrom: '',
    dateTo: '',
  }
  currentPage.value = 1
}

const refreshLogs = async () => {
  isLoading.value = true
  try {
    await store.fetchFunctionCalls()
    lastUpdate.value = new Date().toLocaleString()
  } catch (error) {
    console.error('Erreur lors du rafraîchissement:', error)
  } finally {
    isLoading.value = false
  }
}

const exportAuditLog = () => {
  // Export CSV des appels de fonctions
  const csvContent = [
    ['Date', 'Fonction', 'Utilisateur', 'Statut', 'Temps Réponse', 'IP'].join(','),
    ...filteredLogs.value.map(call => [
      new Date(call.timestamp).toISOString(),
      getFunctionLabel(call.functionName),
      call.username || 'Anonyme',
      call.success ? 'Succès' : 'Échec',
      `${call.responseTime}ms`,
      call.ipAddress || '',
    ].join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `function-calls-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}

// Utilitaires
const getFunctionLabel = (functionName: string) => {
  const labels = {
    'password-generator': 'Génération mot de passe',
    '2fa-generator': 'Génération 2FA',
    'user-auth': 'Authentification'
  }
  return labels[functionName] || functionName
}

const formatDateTime = (date: Date | string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  refreshLogs()
})
</script> 