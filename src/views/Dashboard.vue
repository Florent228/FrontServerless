<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- En-tête avec animations -->
    <div 
      ref="headerRef"
      class="mb-8"
      :class="{ 'animate-fade-in': isHeaderVisible }"
    >
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Dashboard Serverless
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Vue d'ensemble de vos fonctions serverless OpenFaaS
      </p>
    </div>

    <!-- Cards KPI avec intersection observer -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <KPICard
        v-for="(kpi, index) in kpiCards"
        :key="kpi.title"
        :title="kpi.title"
        :value="kpi.value"
        :change="kpi.change"
        :icon="kpi.icon"
        :color="kpi.color"
        :delay="index * 100"
      />
    </div>

    <!-- Historique des appels de fonctions -->
    <div class="card overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Appels de fonctions récents
          </h2>
          <div class="flex items-center space-x-3">
            <!-- Bouton refresh avec debounce -->
            <button
              @click="refreshFunctionCalls"
              :disabled="isRefreshing"
              class="btn-secondary text-sm"
              title="Actualiser (debounce 500ms)"
            >
              <ArrowPathIcon 
                class="w-4 h-4 mr-2"
                :class="{ 'animate-spin': isRefreshing }"
              />
              Actualiser
            </button>
            
            <RouterLink to="/functions" class="btn-primary text-sm">
              <ServerIcon class="w-4 h-4 mr-2" />
              Tester les fonctions
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Table des appels de fonctions -->
      <div class="relative">
        <div v-if="store.functionCalls?.length" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
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
                  Temps
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="call in store.functionCalls?.slice(0, 10)" :key="call.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <ServerIcon class="w-4 h-4 text-gray-400 mr-2" />
                    <span class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ getFunctionLabel(call.functionName) }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ call.username || 'Anonyme' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="call.success ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ call.success ? 'Succès' : 'Échec' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ call.responseTime }}ms
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDateTime(call.timestamp) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- État vide -->
        <div v-else class="text-center py-12">
          <ServerIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            Aucun appel de fonction
          </h3>
          <p class="mt-2 text-gray-600 dark:text-gray-400">
            Commencez par tester vos fonctions serverless
          </p>
          <RouterLink to="/functions" class="mt-4 btn-primary inline-flex items-center">
            <ServerIcon class="w-4 h-4 mr-2" />
            Tester les fonctions
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import {
  ArrowPathIcon,
  UserPlusIcon,
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
  ServerIcon,
} from '@heroicons/vue/24/outline'
import { useMainStore } from '@/stores'
import { useScrollAnimation } from '@/composables/useIntersectionObserver'
import { debounce } from '@/composables/useDebounce'
import { toast } from 'vue-sonner'
import KPICard from '@/components/dashboard/KPICard.vue'
import VirtualizedUserTable from '@/components/dashboard/VirtualizedUserTable.vue'

const router = useRouter()
const store = useMainStore()
const isRefreshing = ref(false)

// Animation header
const { isVisible: isHeaderVisible, animationTarget: headerRef } = useScrollAnimation()

// KPI Cards avec données du store - adapté pour les fonctions serverless
const kpiCards = computed(() => [
  {
    title: 'Fonctions Déployées',
    value: store.kpiData?.totalFunctions?.toString() || '3',
    change: `${store.kpiData?.activeFunctions || 3} actives`,
    icon: ServerIcon,
    color: 'blue',
  },
  {
    title: 'Appels Aujourd\'hui',
    value: store.kpiData?.totalCalls?.toString() || '0',
    change: store.kpiData?.newCallsToday ? `+${store.kpiData.newCallsToday} dernière heure` : 'Aucun appel récent',
    icon: CheckCircleIcon,
    color: 'green',
  },
  {
    title: 'Temps de Réponse Moyen',
    value: store.kpiData?.averageResponseTime ? `${store.kpiData.averageResponseTime}ms` : '1.2s',
    change: `${store.kpiData?.errorRate || 0}% d'erreurs`,
    icon: ClockIcon,
    color: store.kpiData?.averageResponseTime && store.kpiData.averageResponseTime > 1000 ? 'red' : 'yellow',
  },
  {
    title: 'Utilisateurs Authentifiés',
    value: store.kpiData?.authenticatedUsers?.toString() || '0',
    change: `${Math.round(((store.kpiData?.authenticatedUsers || 0) / Math.max(store.kpiData?.totalUsers || 1, 1)) * 100)}% de succès`,
    icon: UsersIcon,
    color: 'purple',
  },
])

// Refresh des appels de fonctions avec debounce 500ms
const refreshFunctionCalls = debounce(async () => {
  try {
    isRefreshing.value = true
    await Promise.all([
      store.fetchFunctionCalls(),
      store.fetchKPIData(),
    ])
    toast.success('Données actualisées')
  } catch (error) {
    toast.error('Erreur lors de l\'actualisation')
  } finally {
    isRefreshing.value = false
  }
}, 500)

// Utilitaires pour l'affichage
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

// Chargement initial des données
onMounted(async () => {
  try {
    await Promise.all([
      store.fetchFunctionCalls(),
      store.fetchKPIData(),
    ])
  } catch (error) {
    console.error('Erreur lors du chargement initial:', error)
  }
})
</script> 