<template>
  <div class="password-strength-meter">
    <!-- Barre de progression -->
    <div class="flex space-x-1 mb-2">
      <div
        v-for="i in 4"
        :key="i"
        class="flex-1 h-2 rounded-full transition-all duration-300"
        :class="getBarColor(i)"
      ></div>
    </div>

    <!-- Texte de force -->
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium" :class="strengthTextColor">
        {{ strengthText }}
      </span>
      <span class="text-xs text-gray-500 dark:text-gray-400">
        {{ score }}/4
      </span>
    </div>

    <!-- Feedback et suggestions (progressive disclosure) -->
    <div 
      v-if="showDetails && (feedback.length > 0 || suggestions.length > 0)"
      class="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm"
    >
      <!-- Feedback -->
      <div v-if="feedback.length > 0" class="mb-2">
        <p class="font-medium text-gray-700 dark:text-gray-300 mb-1">
          Problèmes détectés :
        </p>
        <ul class="list-disc list-inside space-y-1 text-red-600 dark:text-red-400">
          <li v-for="item in feedback" :key="item">{{ item }}</li>
        </ul>
      </div>

      <!-- Suggestions -->
      <div v-if="suggestions.length > 0">
        <p class="font-medium text-gray-700 dark:text-gray-300 mb-1">
          Suggestions d'amélioration :
        </p>
        <ul class="list-disc list-inside space-y-1 text-blue-600 dark:text-blue-400">
          <li v-for="item in suggestions" :key="item">{{ item }}</li>
        </ul>
      </div>
    </div>

    <!-- Toggle pour afficher/masquer les détails -->
    <button
      v-if="feedback.length > 0 || suggestions.length > 0"
      @click="showDetails = !showDetails"
      class="mt-2 text-xs text-primary hover:text-primary-dark transition-colors"
    >
      {{ showDetails ? 'Masquer les détails' : 'Voir les détails' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { PasswordStrength } from '@/types'

interface Props {
  password: string
}

const props = defineProps<Props>()

const showDetails = ref(false)

// Calcul de la force du mot de passe
const passwordAnalysis = computed((): PasswordStrength => {
  const password = props.password
  
  if (!password) {
    return {
      score: 0,
      feedback: [],
      suggestions: ['Entrez un mot de passe'],
    }
  }

  let score = 0
  const feedback: string[] = []
  const suggestions: string[] = []

  // Critères d'évaluation
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    special: /[@$!%*?&]/.test(password),
    longEnough: password.length >= 12,
    veryLong: password.length >= 16,
  }

  // Calcul du score de base
  if (checks.length) score++
  if (checks.lowercase) score++
  if (checks.uppercase) score++
  if (checks.numbers) score++
  if (checks.special) score++

  // Bonus pour longueur
  if (checks.longEnough) score += 0.5
  if (checks.veryLong) score += 0.5

  // Normaliser le score sur 4
  score = Math.min(4, Math.max(0, Math.round(score * 0.6)))

  // Génération du feedback
  if (!checks.length) {
    feedback.push('Trop court (minimum 8 caractères)')
  }
  if (!checks.lowercase) {
    feedback.push('Manque de lettres minuscules')
  }
  if (!checks.uppercase) {
    feedback.push('Manque de lettres majuscules')
  }
  if (!checks.numbers) {
    feedback.push('Manque de chiffres')
  }
  if (!checks.special) {
    feedback.push('Manque de caractères spéciaux (@$!%*?&)')
  }

  // Génération des suggestions
  if (password.length < 12) {
    suggestions.push('Utilisez au moins 12 caractères pour une meilleure sécurité')
  }
  if (!/(.)\1{2,}/.test(password) === false) {
    suggestions.push('Évitez les caractères répétés')
  }
  if (password.toLowerCase().includes('password') || 
      password.toLowerCase().includes('123456') ||
      password.toLowerCase().includes('azerty')) {
    suggestions.push('Évitez les mots de passe courants')
    score = Math.max(0, score - 1)
  }

  return { score, feedback, suggestions }
})

// Propriétés calculées pour l'affichage
const { score, feedback, suggestions } = passwordAnalysis.value

const strengthLevels = [
  { text: 'Très faible', color: 'text-red-600 dark:text-red-400' },
  { text: 'Faible', color: 'text-orange-600 dark:text-orange-400' },
  { text: 'Correcte', color: 'text-yellow-600 dark:text-yellow-400' },
  { text: 'Forte', color: 'text-green-600 dark:text-green-400' },
  { text: 'Très forte', color: 'text-green-700 dark:text-green-300' },
]

const strengthText = computed(() => {
  return strengthLevels[passwordAnalysis.value.score]?.text || 'Très faible'
})

const strengthTextColor = computed(() => {
  return strengthLevels[passwordAnalysis.value.score]?.color || 'text-red-600'
})

const getBarColor = (index: number): string => {
  const score = passwordAnalysis.value.score
  const isActive = index <= score

  if (!isActive) {
    return 'bg-gray-200 dark:bg-gray-600'
  }

  const colors = [
    'bg-red-500',     // 1
    'bg-orange-500',  // 2
    'bg-yellow-500',  // 3
    'bg-green-500',   // 4
  ]

  return colors[score - 1] || 'bg-gray-200'
}

// Réinitialiser l'affichage des détails quand le mot de passe change
watch(() => props.password, () => {
  showDetails.value = false
})
</script>

<style scoped>
.password-strength-meter {
  @apply w-full;
}
</style> 