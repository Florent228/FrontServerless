<template>
  <div class="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full text-center">
      <!-- Animation d'erreur -->
      <div 
        class="mx-auto h-24 w-24 mb-8"
        v-motion
        :initial="{ scale: 0, rotate: -180 }"
        :enter="{ scale: 1, rotate: 0, transition: { duration: 500 } }"
      >
        <div class="relative">
          <div class="absolute inset-0 bg-red-100 dark:bg-red-900 rounded-full animate-ping opacity-75"></div>
          <div class="relative bg-red-500 rounded-full h-24 w-24 flex items-center justify-center">
            <span class="text-white text-3xl font-bold">404</span>
          </div>
        </div>
      </div>

      <!-- Titre et description -->
      <div 
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 200, duration: 500 } }"
      >
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Page non trouvée
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
      </div>

      <!-- Actions -->
      <div 
        class="space-y-4"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 400, duration: 500 } }"
      >
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <RouterLink to="/" class="btn-primary">
            <HomeIcon class="w-5 h-5 mr-2" />
            Retour au dashboard
          </RouterLink>
          <button @click="goBack" class="btn-secondary">
            <ArrowLeftIcon class="w-5 h-5 mr-2" />
            Page précédente
          </button>
        </div>

        <!-- Liens utiles -->
        <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Liens utiles :
          </p>
          <div class="flex flex-wrap justify-center gap-4">
            <RouterLink 
              to="/create-user" 
              class="text-primary hover:text-primary-dark text-sm transition-colors"
            >
              Créer un utilisateur
            </RouterLink>
            <RouterLink 
              to="/auth-test" 
              class="text-primary hover:text-primary-dark text-sm transition-colors"
            >
              Test d'authentification
            </RouterLink>
            <RouterLink 
              to="/audit-log" 
              class="text-primary hover:text-primary-dark text-sm transition-colors"
            >
              Journal d'audit
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Informations de debug en mode dev -->
      <div 
        v-if="isDev" 
        class="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left"
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1, transition: { delay: 600, duration: 500 } }"
      >
        <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Informations de debug
        </h3>
        <dl class="text-sm space-y-1">
          <div class="flex justify-between">
            <dt class="text-gray-600 dark:text-gray-400">URL demandée :</dt>
            <dd class="text-gray-900 dark:text-white font-mono">{{ currentPath }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-gray-600 dark:text-gray-400">Timestamp :</dt>
            <dd class="text-gray-900 dark:text-white">{{ timestamp }}</dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { HomeIcon, ArrowLeftIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()

// Informations de debug
const isDev = computed(() => import.meta.env.DEV)
const currentPath = computed(() => route.fullPath)
const timestamp = computed(() => new Date().toLocaleString('fr-FR'))

// Navigation
const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}
</script> 