<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- En-tête -->
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Test d'authentification serverless
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Testez la fonction d'authentification OpenFaaS avec login + mot de passe + code 2FA
      </p>
    </div>

    <!-- Formulaire de connexion -->
    <div class="card p-8">
      <form @submit.prevent="handleLogin" class="space-y-6" role="form" aria-labelledby="login-form">
        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Adresse email
          </label>
          <input
            id="email"
            v-model="loginForm.email"
            type="email"
            class="input"
            :class="{ 'input-error': emailError }"
            placeholder="votre.email@example.com"
            required
            autocomplete="email"
            aria-describedby="email-error"
            @blur="validateEmail"
            @input="clearEmailError"
          />
          <!-- Validation inline -->
          <p 
            v-if="emailError" 
            id="email-error"
            class="mt-1 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {{ emailError }}
          </p>
        </div>

        <!-- Mot de passe -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mot de passe
          </label>
          <div class="relative">
            <input
              id="password"
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              class="input pr-10"
              :class="{ 'input-error': passwordError }"
              placeholder="Votre mot de passe"
              required
              autocomplete="current-password"
              aria-describedby="password-error"
              @blur="validatePassword"
              @input="clearPasswordError"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
              title="Afficher/masquer le mot de passe"
              aria-label="Basculer la visibilité du mot de passe"
            >
              <EyeIcon v-if="!showPassword" class="h-5 w-5 text-gray-400" />
              <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
            </button>
          </div>
          <!-- Validation inline -->
          <p 
            v-if="passwordError" 
            id="password-error"
            class="mt-1 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {{ passwordError }}
          </p>

          <!-- Password strength meter (progressive disclosure) -->
          <div v-if="showPasswordStrength && loginForm.password" class="mt-2">
            <PasswordStrengthMeter 
              :password="loginForm.password"
            />
          </div>

          <!-- Toggle password strength -->
          <button
            v-if="loginForm.password"
            type="button"
            @click="showPasswordStrength = !showPasswordStrength"
            class="mt-2 text-xs text-primary hover:text-primary-dark transition-colors"
          >
            {{ showPasswordStrength ? 'Masquer' : 'Analyser' }} la force du mot de passe
          </button>
        </div>

        <!-- Code 2FA -->
        <div>
          <label for="twofa-code" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Code 2FA (TOTP) *
          </label>
          <input
            id="twofa-code"
            v-model="loginForm.twoFACode"
            type="text"
            class="input"
            :class="{ 'input-error': twoFAError }"
            placeholder="123456"
            required
            autocomplete="one-time-code"
            maxlength="6"
            pattern="[0-9]{6}"
            aria-describedby="twofa-error"
            @blur="validateTwoFA"
            @input="clearTwoFAError"
          />
          <p 
            v-if="twoFAError" 
            id="twofa-error"
            class="mt-1 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {{ twoFAError }}
          </p>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Code à 6 chiffres de votre application d'authentification
          </p>
        </div>

        <!-- Se souvenir de moi -->
        <div class="flex items-center">
          <input
            id="remember"
            v-model="loginForm.rememberMe"
            type="checkbox"
            class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label for="remember" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Se souvenir de moi
          </label>
        </div>

        <!-- Bouton de connexion -->
        <button
          type="submit"
          :disabled="isLoading || !isFormValid"
          class="w-full btn-primary relative"
          :aria-describedby="isLoading ? 'loading-text' : undefined"
        >
          <span v-if="!isLoading">Se connecter</span>
          <span v-else id="loading-text" class="flex items-center justify-center">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Connexion en cours...
          </span>
        </button>

        <!-- Indicateur de validation du formulaire -->
        <div v-if="!isFormValid && (loginForm.email || loginForm.password)" 
             class="text-sm text-gray-600 dark:text-gray-400 text-center">
          Veuillez corriger les erreurs ci-dessus
        </div>
      </form>
    </div>

    <!-- Résultats du test -->
    <div v-if="testResult" class="mt-8">
      <!-- Succès -->
      <div v-if="testResult.success" class="card p-6 border border-green-200 bg-green-50 dark:bg-green-900 dark:border-green-700">
        <div class="flex items-start">
          <CheckCircleIcon class="w-6 h-6 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
              Authentification réussie !
            </h3>
            <div class="space-y-3">
              <!-- Informations utilisateur -->
              <div v-if="testResult.user" class="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 class="font-medium text-gray-900 dark:text-white mb-2">
                  Informations utilisateur
                </h4>
                <dl class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt class="text-gray-600 dark:text-gray-400">Nom :</dt>
                    <dd class="font-medium text-gray-900 dark:text-white">{{ testResult.user.name }}</dd>
                  </div>
                  <div>
                    <dt class="text-gray-600 dark:text-gray-400">Email :</dt>
                    <dd class="font-medium text-gray-900 dark:text-white">{{ testResult.user.email }}</dd>
                  </div>
                  <div>
                    <dt class="text-gray-600 dark:text-gray-400">Rôle :</dt>
                    <dd class="font-medium text-gray-900 dark:text-white">{{ formatRole(testResult.user.role) }}</dd>
                  </div>
                  <div>
                    <dt class="text-gray-600 dark:text-gray-400">Statut :</dt>
                    <dd class="font-medium text-gray-900 dark:text-white">
                      {{ testResult.user.active ? 'Actif' : 'Inactif' }}
                    </dd>
                  </div>
                </dl>
              </div>

              <!-- Token information -->
              <div v-if="testResult.token" class="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 class="font-medium text-gray-900 dark:text-white mb-2">
                  Jeton d'authentification
                </h4>
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600 dark:text-gray-400">
                      Expire le :
                    </span>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ formatExpiration(testResult.expiresAt) }}
                    </span>
                  </div>
                  <div class="mt-3">
                    <button
                      @click="copyToken"
                      class="text-sm text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 flex items-center transition-colors"
                    >
                      <ClipboardIcon class="w-4 h-4 mr-1" />
                      {{ tokenCopied ? 'Token copié !' : 'Copier le token' }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- QR Code si disponible -->
              <div v-if="testResult.qrCode" class="text-center">
                <h4 class="font-medium text-gray-900 dark:text-white mb-3">
                  QR Code de session
                </h4>
                <div class="inline-block p-3 bg-white rounded-lg shadow-sm">
                  <img
                    :src="testResult.qrCode"
                    alt="QR Code session"
                    class="w-32 h-32 mx-auto"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
            </div>

            <!-- Animation confetti déclenchée après succès -->
            <div ref="confettiTrigger"></div>
          </div>
        </div>
      </div>

      <!-- Erreur -->
      <div v-else class="card p-6 border border-red-200 bg-red-50 dark:bg-red-900 dark:border-red-700">
        <div class="flex items-start">
          <XCircleIcon class="w-6 h-6 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 class="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Échec de l'authentification
            </h3>
            <p class="text-red-700 dark:text-red-300">
              {{ testResult.message || 'Identifiants incorrects ou compte inactif' }}
            </p>
            <div class="mt-4">
              <button
                @click="resetTest"
                class="text-sm text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Aide et informations -->
    <div class="mt-8 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
      <div class="flex items-start">
        <InformationCircleIcon class="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
        <div>
          <h3 class="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
            À propos de ce test
          </h3>
          <ul class="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Ce formulaire teste la fonction d'authentification OpenFaaS</li>
            <li>• Utilisez login + mot de passe + code 2FA pour valider l'authentification</li>
            <li>• En cas de succès, vous verrez un JWT token et les informations utilisateur</li>
            <li>• La fonction vérifie l'âge des identifiants (max 6 mois)</li>
            <li>• La validation est effectuée en temps réel pour une meilleure UX</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick } from 'vue'
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, XCircleIcon, ClipboardIcon, InformationCircleIcon } from '@heroicons/vue/24/outline'
import { toast } from 'vue-sonner'
import { api } from '@/plugins/axios'
import type { AuthTestResult } from '@/types'
import PasswordStrengthMeter from '@/components/forms/PasswordStrengthMeter.vue'

// État du formulaire
const loginForm = reactive({
  email: '',
  password: '',
  twoFACode: '',
  rememberMe: false,
})

// État de l'interface
const showPassword = ref(false)
const showPasswordStrength = ref(false)
const isLoading = ref(false)
const testResult = ref<AuthTestResult | null>(null)
const tokenCopied = ref(false)

// Erreurs de validation inline
const emailError = ref('')
const passwordError = ref('')
const twoFAError = ref('')

// Référence pour le confetti
const confettiTrigger = ref<HTMLElement>()

// Validation en temps réel
const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!loginForm.email) {
    emailError.value = 'L\'email est requis'
  } else if (!emailRegex.test(loginForm.email)) {
    emailError.value = 'Format d\'email invalide'
  } else {
    emailError.value = ''
  }
}

const validatePassword = () => {
  if (!loginForm.password) {
    passwordError.value = 'Le mot de passe est requis'
  } else if (loginForm.password.length < 6) {
    passwordError.value = 'Le mot de passe doit contenir au moins 6 caractères'
  } else {
    passwordError.value = ''
  }
}

const validateTwoFA = () => {
  const codeRegex = /^[0-9]{6}$/
  if (!loginForm.twoFACode) {
    twoFAError.value = 'Le code 2FA est requis'
  } else if (!codeRegex.test(loginForm.twoFACode)) {
    twoFAError.value = 'Le code doit être composé de 6 chiffres'
  } else {
    twoFAError.value = ''
  }
}

// Nettoyage des erreurs lors de la saisie
const clearEmailError = () => {
  if (emailError.value) emailError.value = ''
}

const clearPasswordError = () => {
  if (passwordError.value) passwordError.value = ''
}

const clearTwoFAError = () => {
  if (twoFAError.value) twoFAError.value = ''
}

// Validation globale du formulaire
const isFormValid = computed(() => {
  return loginForm.email && 
         loginForm.password && 
         loginForm.twoFACode &&
         !emailError.value && 
         !passwordError.value &&
         !twoFAError.value
})

// Formatage du rôle
const formatRole = (role: string) => {
  const roles = {
    admin: 'Administrateur',
    moderator: 'Modérateur',
    user: 'Utilisateur',
  }
  return roles[role as keyof typeof roles] || role
}

// Formatage de l'expiration
const formatExpiration = (expiresAt?: string) => {
  if (!expiresAt) return 'Non spécifié'
  return new Date(expiresAt).toLocaleString('fr-FR')
}

// Copier le token
const copyToken = async () => {
  if (!testResult.value?.token) return

  try {
    await navigator.clipboard.writeText(testResult.value.token)
    tokenCopied.value = true
    toast.success('Token copié dans le presse-papiers')
    
    setTimeout(() => {
      tokenCopied.value = false
    }, 3000)
  } catch (error) {
    toast.error('Impossible de copier le token')
  }
}

// Gestion de la soumission
const handleLogin = async () => {
  // Validation finale
  validateEmail()
  validatePassword()
  validateTwoFA()

  if (!isFormValid.value) {
    toast.error('Veuillez corriger les erreurs dans le formulaire')
    return
  }

  try {
    isLoading.value = true
    testResult.value = null

    // Test d'authentification avec fonction serverless
    const response = await api.post<{ data: AuthTestResult }>('/api/auth/test', {
      username: loginForm.email, // La fonction attend username, pas email
      password: loginForm.password,
      twoFACode: loginForm.twoFACode,
      rememberMe: loginForm.rememberMe,
    })

    testResult.value = response.data.data

    if (testResult.value.success) {
      toast.success('Authentification réussie !')
      
      // Animation confetti après un délai
      await nextTick()
      setTimeout(async () => {
        const confetti = await import('canvas-confetti')
        confetti.default({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
      }, 500)
    } else {
      toast.error('Échec de l\'authentification')
    }

  } catch (error: any) {
    console.error('Erreur test auth:', error)
    
    // Création d'un résultat d'erreur
    testResult.value = {
      success: false,
      message: error.response?.data?.message || 'Erreur de connexion au serveur',
    }
    
    toast.error('Erreur lors du test d\'authentification')
  } finally {
    isLoading.value = false
  }
}

// Réinitialiser le test
const resetTest = () => {
  testResult.value = null
  loginForm.email = ''
  loginForm.password = ''
  loginForm.twoFACode = ''
  loginForm.rememberMe = false
  emailError.value = ''
  passwordError.value = ''
  twoFAError.value = ''
  showPasswordStrength.value = false
}
</script> 