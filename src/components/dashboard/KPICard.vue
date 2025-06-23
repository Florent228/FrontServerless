<template>
  <div
    ref="cardRef"
    class="card p-6 transition-all duration-500"
    :class="{
      'animate-slide-up': isVisible,
      'opacity-0 translate-y-4': !isVisible
    }"
    :style="{ animationDelay: `${delay}ms` }"
    v-motion
    :initial="{ opacity: 0, y: 20 }"
    :visible="{ opacity: 1, y: 0 }"
  >
    <!-- En-tête avec icône -->
    <div class="flex items-center justify-between mb-4">
      <div 
        class="p-2 rounded-lg"
        :class="iconClasses"
      >
        <component :is="icon" class="w-6 h-6" />
      </div>
      <div 
        class="px-2 py-1 rounded-full text-xs font-medium"
        :class="badgeClasses"
      >
        {{ badgeText }}
      </div>
    </div>

    <!-- Valeur principale -->
    <div class="mb-2">
      <div 
        class="text-2xl font-bold"
        :class="valueClasses"
      >
        {{ displayValue }}
      </div>
    </div>

    <!-- Changement/tendance -->
    <div class="text-sm text-gray-600 dark:text-gray-400">
      {{ change }}
    </div>

    <!-- Indicateur de chargement si nécessaire -->
    <div v-if="loading" class="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-50 flex items-center justify-center rounded-2xl">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useScrollAnimation } from '@/composables/useIntersectionObserver'

interface Props {
  title: string
  value: string | number
  change?: string
  icon: any
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
  delay?: number
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  color: 'blue',
  delay: 0,
  loading: false,
})

// Animation au scroll
const { isVisible, animationTarget: cardRef } = useScrollAnimation(0.1)

// Classes dynamiques selon la couleur
const iconClasses = computed(() => {
  const baseClasses = 'text-white'
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
  }
  return [baseClasses, colorClasses[props.color]]
})

const valueClasses = computed(() => {
  const colorClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    purple: 'text-purple-600 dark:text-purple-400',
  }
  return ['text-gray-900 dark:text-white', colorClasses[props.color]]
})

const badgeClasses = computed(() => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  }
  return colorClasses[props.color]
})

// Texte du badge basé sur la couleur
const badgeText = computed(() => {
  const texts = {
    blue: 'Total',
    green: 'Actif',
    red: 'Critique',
    yellow: 'Moyenne',
    purple: 'Services',
  }
  return texts[props.color]
})

// Formatage de la valeur
const displayValue = computed(() => {
  if (props.loading) return '...'
  
  const numValue = typeof props.value === 'string' ? parseInt(props.value) : props.value
  
  // Formatage pour les gros nombres
  if (!isNaN(numValue) && numValue >= 1000) {
    if (numValue >= 1000000) {
      return `${(numValue / 1000000).toFixed(1)}M`
    }
    if (numValue >= 1000) {
      return `${(numValue / 1000).toFixed(1)}K`
    }
  }
  
  return props.value
})
</script>

<style scoped>
/* Animation personnalisée pour les reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .card {
    animation: none !important;
    transition: none !important;
  }
}
</style> 