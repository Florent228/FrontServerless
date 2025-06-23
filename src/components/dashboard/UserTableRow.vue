<template>
  <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
    <!-- Informations utilisateur -->
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="flex items-center">
        <div class="flex-shrink-0 h-10 w-10">
          <img
            v-if="user.avatar"
            :src="user.avatar"
            :alt="`Avatar de ${user.name}`"
            class="h-10 w-10 rounded-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div v-else class="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ userInitials }}
            </span>
          </div>
        </div>
        <div class="ml-4">
          <div class="text-sm font-medium text-gray-900 dark:text-white">
            {{ user.name }}
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            {{ user.email }}
          </div>
        </div>
      </div>
    </td>

    <!-- Rôle -->
    <td class="px-6 py-4 whitespace-nowrap">
      <span 
        class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
        :class="roleClasses"
      >
        {{ roleText }}
      </span>
    </td>

    <!-- Statut -->
    <td class="px-6 py-4 whitespace-nowrap">
      <span 
        class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full"
        :class="statusClasses"
      >
        <span 
          class="w-1.5 h-1.5 rounded-full mr-1.5"
          :class="statusDotClasses"
        ></span>
        {{ user.active ? 'Actif' : 'Inactif' }}
      </span>
    </td>

    <!-- Dernière connexion -->
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
      {{ lastLoginFormatted }}
    </td>

    <!-- Actions -->
    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
      <div class="flex items-center justify-end space-x-2">
        <button
          @click="$emit('view', user.id)"
          class="text-primary hover:text-primary-dark transition-colors"
          title="Voir les détails"
        >
          <EyeIcon class="w-4 h-4" />
        </button>
        <button
          @click="$emit('delete', user.id)"
          class="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
          title="Supprimer"
        >
          <TrashIcon class="w-4 h-4" />
        </button>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { EyeIcon, TrashIcon } from '@heroicons/vue/24/outline'
import type { User } from '@/types'

interface Props {
  user: User
}

interface Emits {
  (e: 'view', userId: string): void
  (e: 'delete', userId: string): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

// Initiales de l'utilisateur
const userInitials = computed(() => {
  return props.user.name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
})

// Classes CSS pour le rôle
const roleClasses = computed(() => {
  const roleColors = {
    admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    moderator: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    user: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  }
  return roleColors[props.user.role] || roleColors.user
})

// Texte du rôle localisé
const roleText = computed(() => {
  const roleTexts = {
    admin: 'Administrateur',
    moderator: 'Modérateur',
    user: 'Utilisateur',
  }
  return roleTexts[props.user.role] || 'Utilisateur'
})

// Classes CSS pour le statut
const statusClasses = computed(() => {
  return props.user.active
    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
})

const statusDotClasses = computed(() => {
  return props.user.active
    ? 'bg-green-400'
    : 'bg-gray-400'
})

// Formatage de la dernière connexion
const lastLoginFormatted = computed(() => {
  if (!props.user.lastLogin) {
    return 'Jamais'
  }

  const date = new Date(props.user.lastLogin)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) {
    return 'Hier'
  } else if (diffDays <= 7) {
    return `Il y a ${diffDays} jours`
  } else {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: diffDays > 365 ? 'numeric' : undefined,
    })
  }
})
</script> 