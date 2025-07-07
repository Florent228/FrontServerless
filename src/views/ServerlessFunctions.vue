<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- En-tête -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Fonctions Serverless OpenFaaS
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          Interface de test et d'utilisation des 3 fonctions serverless : génération de mot de passe, 2FA et authentification
        </p>
      </div>

      <!-- État de connexion OpenFaaS -->
      <div class="mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <div 
                :class="[
                  'w-3 h-3 rounded-full mr-3',
                  connectionStatus ? 'bg-green-400' : 'bg-red-400'
                ]"
              ></div>
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                OpenFaaS {{ connectionStatus ? 'Connecté' : 'Déconnecté' }}
              </span>
            </div>
            <div class="flex items-center space-x-3">
              <span class="text-xs text-gray-500 dark:text-gray-400">
                {{ config.baseUrl }}
              </span>
              <button
                @click="testConnection"
                :disabled="isTestingConnection"
                class="btn-secondary text-xs"
              >
                <span v-if="!isTestingConnection">Tester connexion</span>
                <span v-else class="flex items-center">
                  <div class="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-1"></div>
                  Test...
                </span>
              </button>
            </div>
          </div>
          
          <!-- Configuration OpenFaaS -->
          <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Configuration OpenFaaS
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL OpenFaaS
                </label>
                <input
                  v-model="config.baseUrl"
                  @change="updateConfig"
                  type="url"
                  class="input text-xs"
                  placeholder="http://localhost:8080"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Génération mot de passe
                </label>
                <input
                  :value="config.functions.passwordGeneration.endpoint"
                  class="input text-xs font-mono bg-gray-50 dark:bg-gray-700"
                  readonly
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Génération 2FA
                </label>
                <input
                  :value="config.functions.twoFactorGeneration.endpoint"
                  class="input text-xs font-mono bg-gray-50 dark:bg-gray-700"
                  readonly
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Onglets pour les différentes fonctions -->
      <div class="mb-6">
        <nav class="flex space-x-8">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors flex items-center',
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            ]"
          >
            <component :is="tab.icon" class="w-5 h-5 mr-2" />
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <!-- Contenu des onglets -->
      <div class="space-y-6">
        <!-- Fonction 1: Génération de mot de passe (24 caractères) -->
        <div v-if="activeTab === 'password'" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center mb-6">
            <KeyIcon class="w-6 h-6 text-primary mr-3" />
            <div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                Génération de Mot de Passe
              </h2>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Génère un mot de passe de 24 caractères avec majuscules, minuscules, chiffres et caractères spéciaux + QR code
              </p>
            </div>
          </div>

          <form @submit.prevent="generatePassword" class="space-y-4">
            <div>
              <label for="pwd-username" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom d'utilisateur
              </label>
              <input
                id="pwd-username"
                v-model="passwordForm.username"
                type="text"
                class="input"
                placeholder="username"
                required
              />
            </div>

            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="isGeneratingPassword"
                class="btn-primary"
              >
                <span v-if="!isGeneratingPassword">🔐 Générer le mot de passe</span>
                <span v-else class="flex items-center">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Génération en cours...
                </span>
              </button>
            </div>
          </form>

          <!-- Résultat génération mot de passe -->
          <div v-if="passwordResult" class="mt-6">
            <div v-if="passwordResult.success" class="p-4 bg-green-50 dark:bg-green-900 rounded-lg border border-green-200 dark:border-green-700">
              <h3 class="text-lg font-medium text-green-800 dark:text-green-200 mb-4">
                ✅ Mot de passe généré avec succès
              </h3>
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                    Mot de passe (24 caractères)
                  </label>
                  <div class="flex items-center space-x-2">
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      :value="passwordResult.password"
                      class="input font-mono text-sm"
                      readonly
                    />
                    <button
                      @click="showPassword = !showPassword"
                      class="btn-secondary"
                    >
                      <component :is="showPassword ? EyeSlashIcon : EyeIcon" class="w-4 h-4" />
                    </button>
                  </div>
                  <p class="text-xs text-green-600 dark:text-green-400 mt-1">
                    🕒 Expire le: {{ formatDate(passwordResult.expiresAt) }}
                  </p>
                </div>
                <div v-if="passwordResult.qrCode">
                  <label class="block text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                    QR Code (transmission unique)
                  </label>
                  <img 
                    :src="`data:image/png;base64,${passwordResult.qrCode}`"
                    alt="QR Code mot de passe"
                    class="w-32 h-32 border rounded bg-white"
                    @error="onQrCodeError"
                  />
                </div>
              </div>
            </div>
            <div v-else class="p-4 bg-red-50 dark:bg-red-900 rounded-lg border border-red-200 dark:border-red-700">
              <h3 class="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
                ❌ Erreur lors de la génération
              </h3>
              <p class="text-sm text-red-700 dark:text-red-300">
                {{ passwordResult.error || passwordResult.message }}
              </p>
            </div>
          </div>
        </div>

        <!-- Fonction 2: Génération secret 2FA TOTP -->
        <div v-if="activeTab === '2fa'" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center mb-6">
            <ShieldCheckIcon class="w-6 h-6 text-primary mr-3" />
            <div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                Génération Secret 2FA (TOTP)
              </h2>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Génère un secret de double authentification basé sur le temps (TOTP) avec QR code
              </p>
            </div>
          </div>

          <form @submit.prevent="generate2FA" class="space-y-4">
            <div>
              <label for="tfa-username" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom d'utilisateur
              </label>
              <input
                id="tfa-username"
                v-model="twoFAForm.username"
                type="text"
                class="input"
                placeholder="username"
                required
              />
            </div>

            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="isGenerating2FA"
                class="btn-primary"
              >
                <span v-if="!isGenerating2FA">🛡️ Générer le secret 2FA</span>
                <span v-else class="flex items-center">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Génération en cours...
                </span>
              </button>
            </div>
          </form>

          <!-- Résultat génération 2FA -->
          <div v-if="twoFAResult" class="mt-6">
            <div v-if="twoFAResult.success" class="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
              <h3 class="text-lg font-medium text-blue-800 dark:text-blue-200 mb-4">
                ✅ Secret 2FA généré avec succès
              </h3>
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                    Secret TOTP
                  </label>
                  <input
                    :value="twoFAResult.secret"
                    class="input font-mono text-sm"
                    readonly
                  />
                  <div class="mt-3">
                    <label class="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                      Codes de récupération
                    </label>
                    <div class="grid grid-cols-2 gap-2">
                      <span
                        v-for="code in twoFAResult.backupCodes"
                        :key="code"
                        class="text-xs font-mono bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded"
                      >
                        {{ code }}
                      </span>
                    </div>
                  </div>
                </div>
                <div v-if="twoFAResult.qrCode">
                  <label class="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                    QR Code TOTP
                  </label>
                  <img 
                    :src="twoFAResult.qrCode"
                    alt="QR Code 2FA"
                    class="w-32 h-32 border rounded bg-white"
                  />
                  <p class="text-xs text-blue-600 dark:text-blue-400 mt-2">
                    📱 Scannez avec votre app d'authentification
                  </p>
                </div>
              </div>
            </div>
            <div v-else class="p-4 bg-red-50 dark:bg-red-900 rounded-lg border border-red-200 dark:border-red-700">
              <h3 class="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
                ❌ Erreur lors de la génération
              </h3>
              <p class="text-sm text-red-700 dark:text-red-300">
                {{ twoFAResult.error || twoFAResult.message }}
              </p>
            </div>
          </div>
        </div>

        <!-- Fonction 3: Authentification avec vérification d'expiration -->
        <div v-if="activeTab === 'auth'" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center mb-6">
            <UserIcon class="w-6 h-6 text-primary mr-3" />
            <div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                Authentification Utilisateur
              </h2>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Authentifie un utilisateur avec login + mot de passe + code 2FA (vérification d'expiration 6 mois)
              </p>
            </div>
          </div>

          <form @submit.prevent="authenticate" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label for="auth-username" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom d'utilisateur
                </label>
                <input
                  id="auth-username"
                  v-model="authForm.username"
                  type="text"
                  class="input"
                  placeholder="username"
                  required
                />
              </div>
              <div>
                <label for="auth-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mot de passe
                </label>
                <input
                  id="auth-password"
                  v-model="authForm.password"
                  type="password"
                  class="input"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label for="auth-mfa" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Code 2FA (6 chiffres)
                </label>
                <input
                  id="auth-mfa"
                  v-model="authForm.mfa_code"
                  type="text"
                  class="input"
                  placeholder="123456"
                  maxlength="6"
                  pattern="[0-9]{6}"
                  required
                />
              </div>
            </div>

            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="isAuthenticating"
                class="btn-primary"
              >
                <span v-if="!isAuthenticating">🔐 Authentifier</span>
                <span v-else class="flex items-center">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Authentification...
                </span>
              </button>
            </div>
          </form>

          <!-- Résultat authentification -->
          <div v-if="authResult" class="mt-6">
            <!-- Authentification réussie -->
            <div 
              v-if="authResult.authenticated"
              class="p-4 bg-green-50 dark:bg-green-900 rounded-lg border border-green-200 dark:border-green-700"
            >
              <h3 class="text-lg font-medium text-green-800 dark:text-green-200 mb-2">
                ✅ Authentification réussie
              </h3>
              <div class="text-sm text-green-700 dark:text-green-300 space-y-1">
                <p><strong>👤 Utilisateur:</strong> {{ authResult.username }}</p>
                <p><strong>🆔 ID:</strong> {{ authResult.userId }}</p>
              </div>
            </div>

            <!-- Identifiants expirés (plus de 6 mois) -->
            <div 
              v-else-if="authResult.expired"
              class="p-4 bg-orange-50 dark:bg-orange-900 rounded-lg border border-orange-200 dark:border-orange-700"
            >
              <h3 class="text-lg font-medium text-orange-800 dark:text-orange-200 mb-2">
                ⚠️ Identifiants expirés
              </h3>
              <p class="text-sm text-orange-700 dark:text-orange-300 mb-3">
                Les identifiants ont plus de 6 mois (expire le {{ formatDate(authResult.expirationDate) }}). 
                Un renouvellement est nécessaire.
              </p>
              <div class="flex space-x-3">
                <button @click="activeTab = 'password'" class="btn-secondary text-sm">
                  🔐 Générer nouveau mot de passe
                </button>
                <button @click="activeTab = '2fa'" class="btn-secondary text-sm">
                  🛡️ Générer nouveau 2FA
                </button>
              </div>
            </div>

            <!-- Authentification échouée -->
            <div 
              v-else
              class="p-4 bg-red-50 dark:bg-red-900 rounded-lg border border-red-200 dark:border-red-700"
            >
              <h3 class="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
                ❌ Authentification échouée
              </h3>
              <p class="text-sm text-red-700 dark:text-red-300">
                {{ authResult.error || 'Identifiants invalides ou code 2FA incorrect' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Historique des appels de fonctions -->
        <div v-if="activeTab === 'history'" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center">
              <ClockIcon class="w-6 h-6 text-primary mr-3" />
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                Historique des Appels de Fonctions
              </h2>
            </div>
            <button @click="clearHistory" class="btn-secondary text-sm">
              🗑️ Effacer l'historique
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fonction Serverless
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Temps de réponse
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="call in functionCalls" :key="call.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    <div class="flex items-center">
                      <component 
                        :is="getFunctionIcon(call.functionName)" 
                        class="w-4 h-4 mr-2 text-primary" 
                      />
                      {{ getFunctionLabel(call.functionName) }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {{ call.username || call.userId || '-' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span 
                      :class="[
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        call.success 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      ]"
                    >
                      {{ call.success ? '✅ Succès' : '❌ Erreur' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {{ call.responseTime }}ms
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {{ formatDateTime(call.timestamp) }}
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- État vide -->
            <div v-if="functionCalls.length === 0" class="text-center py-8">
              <ClockIcon class="mx-auto h-12 w-12 text-gray-400" />
              <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                Aucun appel enregistré
              </h3>
              <p class="mt-2 text-gray-600 dark:text-gray-400">
                L'historique des appels aux fonctions serverless apparaîtra ici.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import {
  KeyIcon,
  ShieldCheckIcon,
  UserIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/vue/24/outline'
import type { ServerlessConfig } from '@/types'
import serverlessApi, { 
  passwordGenerationService, 
  twoFactorGenerationService, 
  authenticationService,
  configService,
  historyService
} from '@/services/serverlessApi'

// Configuration (récupérée depuis le service)
const config = ref<ServerlessConfig>(configService.getConfig())

// État
const activeTab = ref('password')
const connectionStatus = ref(false)
const isTestingConnection = ref(false)
const showPassword = ref(false)

// États de chargement
const isGeneratingPassword = ref(false)
const isGenerating2FA = ref(false)
const isAuthenticating = ref(false)

// Formulaires (simplifiés selon les nouvelles APIs)
const passwordForm = reactive({
  username: 'username',
})

const twoFAForm = reactive({
  username: 'username',
})

const authForm = reactive({
  username: 'username',
  password: '',
  mfa_code: '',
})

// Résultats
const passwordResult = ref(null)
const twoFAResult = ref(null)
const authResult = ref(null)

// Historique des appels
const functionCalls = computed(() => historyService.getFunctionCalls())

// Configuration des onglets
const tabs = [
  { id: 'password', name: 'Mot de passe', icon: KeyIcon },
  { id: '2fa', name: '2FA TOTP', icon: ShieldCheckIcon },
  { id: 'auth', name: 'Authentification', icon: UserIcon },
  { id: 'history', name: 'Historique', icon: ClockIcon },
]

// Méthodes utilitaires
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('fr-FR')
}

const getFunctionIcon = (functionName) => {
  const icons = {
    'password-generation': KeyIcon,
    '2fa-generation': ShieldCheckIcon,
    'authentication': UserIcon
  }
  return icons[functionName] || ClockIcon
}

const getFunctionLabel = (functionName) => {
  const labels = {
    'password-generation': 'Génération mot de passe',
    '2fa-generation': 'Génération 2FA',
    'authentication': 'Authentification'
  }
  return labels[functionName] || functionName
}

// Fonctions serverless réelles
const testConnection = async () => {
  isTestingConnection.value = true
  try {
    connectionStatus.value = await configService.testConnection()
  } finally {
    isTestingConnection.value = false
  }
}

const generatePassword = async () => {
  isGeneratingPassword.value = true
  passwordResult.value = null
  
  try {
    passwordResult.value = await passwordGenerationService.generatePassword(passwordForm)
  } catch (error: any) {
    passwordResult.value = {
      success: false,
      error: error.message || error.error || 'Erreur lors de la génération du mot de passe'
    }
  } finally {
    isGeneratingPassword.value = false
  }
}

const generate2FA = async () => {
  isGenerating2FA.value = true
  twoFAResult.value = null
  
  try {
    twoFAResult.value = await twoFactorGenerationService.generateTwoFactor(twoFAForm)
  } catch (error: any) {
    twoFAResult.value = {
      success: false,
      error: error.message || error.error || 'Erreur lors de la génération du secret 2FA'
    }
  } finally {
    isGenerating2FA.value = false
  }
}

const authenticate = async () => {
  isAuthenticating.value = true
  authResult.value = null
  
  try {
    authResult.value = await authenticationService.authenticate(authForm)
  } catch (error: any) {
    authResult.value = {
      success: false,
      authenticated: false,
      error: error.message || error.error || 'Erreur lors de l\'authentification'
    }
  } finally {
    isAuthenticating.value = false
  }
}

const clearHistory = () => {
  historyService.clearHistory()
}

const updateConfig = () => {
  configService.updateConfig(config.value)
}

const onQrCodeError = (event: Event) => {
  console.error('Erreur de chargement du QR code:', event)
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

onMounted(() => {
  testConnection()
})
</script> 