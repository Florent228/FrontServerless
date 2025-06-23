<template>
  <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
      <div class="flex flex-col">
        <span class="font-medium">
          {{ formatDate(log.timestamp) }}
        </span>
        <span class="text-xs text-gray-500 dark:text-gray-400">
          {{ formatTime(log.timestamp) }}
        </span>
      </div>
    </td>

    <td class="px-6 py-4 whitespace-nowrap">
      <div class="flex items-center">
        <div class="flex-shrink-0 h-8 w-8">
          <div class="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span class="text-xs font-medium text-white">
              {{ log.userName.split(' ').map(n => n[0]).join('') }}
            </span>
          </div>
        </div>
        <div class="ml-3">
          <div class="text-sm font-medium text-gray-900 dark:text-white">
            {{ log.userName }}
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">
            {{ log.ipAddress }}
          </div>
        </div>
      </div>
    </td>

    <td class="px-6 py-4 whitespace-nowrap">
      <span
        :class="[
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          actionColors[log.action]
        ]"
      >
        <component :is="actionIcons[log.action]" class="w-3 h-3 mr-1" />
        {{ actionLabels[log.action] }}
      </span>
    </td>

    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
      <div class="flex flex-col">
        <span class="font-medium capitalize">{{ log.resource }}</span>
        <span class="text-xs text-gray-500 dark:text-gray-400">
          ID: {{ log.resourceId }}
        </span>
      </div>
    </td>

    <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
      <div class="max-w-xs">
        <p class="truncate" :title="log.details">
          {{ log.details }}
        </p>
        <button
          v-if="log.details.length > 50"
          @click="showDetails = !showDetails"
          class="text-xs text-primary hover:text-primary-dark mt-1"
        >
          {{ showDetails ? 'Moins' : 'Plus' }}
        </button>
        
        <!-- Détails étendus -->
        <div v-if="showDetails" class="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
          <p class="mb-2">{{ log.details }}</p>
          <div class="text-gray-600 dark:text-gray-400">
            <p><strong>User Agent:</strong> {{ log.userAgent }}</p>
            <p><strong>Timestamp:</strong> {{ log.timestamp.toISOString() }}</p>
          </div>
        </div>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/vue/24/outline'
import type { AuditLog } from '@/types'

interface Props {
  log: AuditLog
}

defineProps<Props>()

const showDetails = ref(false)

// Configuration des actions
const actionLabels = {
  create: 'Création',
  update: 'Modification',
  delete: 'Suppression',
  login: 'Connexion',
  logout: 'Déconnexion',
}

const actionColors = {
  create: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  update: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  delete: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  login: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  logout: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
}

const actionIcons = {
  create: PlusIcon,
  update: PencilIcon,
  delete: TrashIcon,
  login: ArrowRightOnRectangleIcon,
  logout: ArrowLeftOnRectangleIcon,
}

// Fonctions utilitaires
const formatDate = (date: Date) => {
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
</script> 