<template>
  <nav class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 backdrop-blur-lg bg-opacity-90 dark:bg-opacity-90">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo et navigation principale -->
        <div class="flex items-center space-x-8">
          <RouterLink to="/" class="flex items-center space-x-2 group">
            <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <CloudIcon class="w-5 h-5 text-white" />
            </div>
            <span class="text-xl font-semibold text-gray-900 dark:text-white">FaaS</span>
          </RouterLink>

          <!-- Navigation desktop -->
          <div class="hidden md:flex items-center space-x-6">
            <RouterLink
              v-for="item in navigationItems"
              :key="item.name"
              :to="item.path"
              class="nav-link"
              :class="{ 'nav-link-active': $route.path === item.path }"
            >
              <component :is="item.icon" class="w-4 h-4" />
              <span>{{ item.name }}</span>
            </RouterLink>
          </div>
        </div>

        <!-- Actions droite -->
        <div class="flex items-center space-x-4">
          <!-- Bouton refresh global avec debounce -->
          <button
            @click="handleRefresh"
            :disabled="isRefreshing"
            class="btn-secondary p-2"
            title="Actualiser (500ms debounce)"
          >
            <ArrowPathIcon 
              class="w-4 h-4"
              :class="{ 'animate-spin': isRefreshing }"
            />
          </button>

          <!-- Toggle dark mode -->
          <button
            @click="toggleDarkMode"
            class="btn-secondary p-2"
            :title="isDark ? 'Mode clair' : 'Mode sombre'"
            aria-label="Basculer le thème"
          >
            <SunIcon v-if="isDark" class="w-4 h-4" />
            <MoonIcon v-else class="w-4 h-4" />
          </button>

          <!-- Menu mobile -->
          <button
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="md:hidden btn-secondary p-2"
            aria-label="Menu mobile"
          >
            <Bars3Icon v-if="!isMobileMenuOpen" class="w-4 h-4" />
            <XMarkIcon v-else class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Menu mobile -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-1"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div v-if="isMobileMenuOpen" class="md:hidden py-3 border-t border-gray-200 dark:border-gray-700">
          <div class="space-y-1">
            <RouterLink
              v-for="item in navigationItems"
              :key="item.name"
              :to="item.path"
              @click="isMobileMenuOpen = false"
              class="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              :class="{ 'text-primary bg-gray-50 dark:bg-gray-700': $route.path === item.path }"
            >
              <component :is="item.icon" class="w-5 h-5" />
              <span>{{ item.name }}</span>
            </RouterLink>
          </div>
        </div>
      </Transition>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  CloudIcon,
  HomeIcon,
  UserPlusIcon,
  UsersIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  SunIcon,
  MoonIcon,
  ArrowPathIcon,
  Bars3Icon,
  XMarkIcon,
  CubeIcon,
} from '@heroicons/vue/24/outline'
import { useDarkMode } from '@/composables/useDarkMode'
import { useMainStore } from '@/stores'
import { debounce } from '@/composables/useDebounce'
import { toast } from 'vue-sonner'

// State
const isMobileMenuOpen = ref(false)
const isRefreshing = ref(false)

// Composables
const { isDark, toggleDarkMode } = useDarkMode()
const store = useMainStore()

// Navigation items
const navigationItems = [
  { name: 'Dashboard Serverless', path: '/', icon: HomeIcon },
  { name: 'Fonctions Serverless', path: '/functions', icon: CubeIcon },
  { name: 'Créer utilisateur sécurisé', path: '/create-user', icon: UserPlusIcon },
  { name: 'Test auth serverless', path: '/auth-test', icon: ShieldCheckIcon },
  { name: 'Journal des fonctions', path: '/audit-log', icon: DocumentTextIcon },
]

// Refresh global avec debounce 500ms
const handleRefresh = debounce(async () => {
  try {
    isRefreshing.value = true
    await store.fetchFunctionCalls()
    await store.fetchKPIData()
    toast.success('Données actualisées')
  } catch (error) {
    toast.error('Erreur lors de l\'actualisation')
  } finally {
    isRefreshing.value = false
  }
}, 500)
</script>

<style scoped>
.nav-link {
  @apply flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors;
}

.nav-link-active {
  @apply text-primary bg-gray-50 dark:bg-gray-700;
}
</style> 