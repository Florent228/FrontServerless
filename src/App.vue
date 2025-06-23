<template>
  <div id="app" class="min-h-screen bg-gray-bg dark:bg-gray-900 transition-colors">
    <!-- Barre de progression NProgress -->
    <div id="nprogress-container"></div>
    
    <!-- Navigation principale -->
    <AppNavigation />
    
    <!-- Contenu principal avec Suspense pour le lazy loading -->
    <main class="flex-1">
      <Suspense>
        <template #default>
          <RouterView v-slot="{ Component, route }">
            <component 
              :is="Component" 
              :key="route.fullPath"
              class="animate-fade-in"
            />
          </RouterView>
        </template>
        <template #fallback>
          <AppSkeleton />
        </template>
      </Suspense>
    </main>
    
    <!-- Toast notifications -->
    <Toaster richColors position="top-right" />
    
    <!-- Raccourcis clavier -->
    <KeyboardShortcuts />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { Toaster } from 'vue-sonner'
import AppNavigation from '@/components/layout/AppNavigation.vue'
import AppSkeleton from '@/components/layout/AppSkeleton.vue'
import KeyboardShortcuts from '@/components/layout/KeyboardShortcuts.vue'
import { useDarkMode } from '@/composables/useDarkMode'

// Initialisation du dark mode
const { initDarkMode } = useDarkMode()

onMounted(() => {
  initDarkMode()
})
</script>

<style>
/* Import NProgress styles */
@import 'nprogress/nprogress.css';

/* Personnalisation NProgress */
#nprogress .bar {
  @apply bg-primary;
}

#nprogress .peg {
  @apply shadow-primary;
}

#nprogress .spinner-icon {
  border-top-color: theme('colors.primary.DEFAULT');
  border-left-color: theme('colors.primary.DEFAULT');
}
</style> 