<template>
  <div class="relative">
    <!-- Table normale si < 50 utilisateurs -->
    <div v-if="users.length < virtualThreshold && !loading" class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Utilisateur
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Rôle
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Statut
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Dernière connexion
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <UserTableRow
            v-for="user in users"
            :key="user.id"
            :user="user"
            @view="$emit('view-user', $event)"
            @delete="$emit('delete-user', $event)"
          />
        </tbody>
      </table>
    </div>

    <!-- Table virtualisée si >= 50 utilisateurs -->
    <div v-else-if="users.length >= virtualThreshold && !loading" class="h-96">
      <VirtualList
        :size="itemHeight"
        :remain="visibleItems"
        :bench="benchItems"
        class="virtual-list"
      >
        <!-- En-tête fixe -->
        <template #header>
          <div class="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
            <div class="grid grid-cols-5 gap-4 px-6 py-3">
              <div class="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Utilisateur
              </div>
              <div class="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Rôle
              </div>
              <div class="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Statut
              </div>
              <div class="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Dernière connexion
              </div>
              <div class="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider text-right">
                Actions
              </div>
            </div>
          </div>
        </template>

        <!-- Items virtualisés -->
        <VirtualizedUserRow
          v-for="user in users"
          :key="user.id"
          :user="user"
          @view="$emit('view-user', $event)"
          @delete="$emit('delete-user', $event)"
        />
      </VirtualList>
      
      <!-- Indicateur de performance -->
      <div class="absolute bottom-2 right-2 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
        Virtualisé ({{ users.length }} éléments)
      </div>
    </div>

    <!-- État de chargement -->
    <div v-else-if="loading" class="p-8">
      <div class="animate-pulse space-y-4">
        <div v-for="i in 5" :key="i" class="flex items-center space-x-4">
          <div class="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          <div class="flex-1 space-y-2">
            <div class="w-32 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div class="w-48 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
          <div class="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div class="w-20 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    </div>

    <!-- État vide -->
    <div v-else-if="users.length === 0" class="text-center py-12">
      <UsersIcon class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
        Aucun utilisateur
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Commencez par créer un premier utilisateur.
      </p>
      <div class="mt-6">
        <RouterLink to="/create-user" class="btn-primary">
          <UserPlusIcon class="w-4 h-4 mr-2" />
          Créer un utilisateur
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { RouterLink } from 'vue-router'
import { UsersIcon, UserPlusIcon } from '@heroicons/vue/24/outline'
import type { User } from '@/types'
import UserTableRow from './UserTableRow.vue'

// Lazy load de VirtualList seulement si nécessaire
const VirtualList = defineAsyncComponent(() => import('vue-virtual-scroll-list'))
const VirtualizedUserRow = defineAsyncComponent(() => import('./VirtualizedUserRow.vue'))

interface Props {
  users: User[]
  loading?: boolean
}

interface Emits {
  (e: 'view-user', userId: string): void
  (e: 'delete-user', userId: string): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

defineEmits<Emits>()

// Configuration de la virtualisation
const virtualThreshold = 50 // Seuil pour activer la virtualisation
const itemHeight = 72 // Hauteur de chaque ligne en pixels
const visibleItems = 8 // Nombre d'éléments visibles
const benchItems = 5 // Éléments de buffer
</script>

<style scoped>
.virtual-list {
  height: 100%;
  overflow-y: auto;
}

/* Scrollbar personnalisée */
.virtual-list::-webkit-scrollbar {
  width: 8px;
}

.virtual-list::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-gray-700;
}

.virtual-list::-webkit-scrollbar-thumb {
  @apply bg-gray-300 dark:bg-gray-600 rounded-full;
}

.virtual-list::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400 dark:bg-gray-500;
}
</style> 