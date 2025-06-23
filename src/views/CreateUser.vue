<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- En-tête -->
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Créer un utilisateur sécurisé
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Générez un utilisateur avec mot de passe et 2FA via les fonctions serverless
      </p>
    </div>

    <!-- Formulaire -->
    <div class="card p-8">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Nom -->
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nom complet *
          </label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            class="input"
            :class="{ 'input-error': errors.name }"
            placeholder="Jean Dupont"
            required
          />
          <p v-if="errors.name" class="mt-1 text-sm text-red-600 dark:text-red-400">
            {{ errors.name }}
          </p>
        </div>

        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Adresse email *
          </label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            class="input"
            :class="{ 'input-error': errors.email }"
            placeholder="jean.dupont@example.com"
            required
          />
          <p v-if="errors.email" class="mt-1 text-sm text-red-600 dark:text-red-400">
            {{ errors.email }}
          </p>
        </div>

        <!-- Rôle -->
        <div>
          <label for="role" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rôle *
          </label>
          <select
            id="role"
            v-model="formData.role"
            class="input"
            :class="{ 'input-error': errors.role }"
            required
          >
            <option value="">Sélectionner un rôle</option>
            <option value="user">Utilisateur</option>
            <option value="moderator">Modérateur</option>
            <option value="admin">Administrateur</option>
          </select>
          <p v-if="errors.role" class="mt-1 text-sm text-red-600 dark:text-red-400">
            {{ errors.role }}
          </p>
        </div>

        <!-- Options de sécurité -->
        <div class="space-y-4">
          <div class="flex items-center">
            <input
              id="auto-generate"
              v-model="autoGeneratePassword"
              type="checkbox"
              class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label for="auto-generate" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Générer un mot de passe sécurisé via fonction serverless
            </label>
          </div>
          
          <div class="flex items-center">
            <input
              id="generate-2fa"
              v-model="generate2FA"
              type="checkbox"
              class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label for="generate-2fa" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Générer automatiquement un secret 2FA TOTP
            </label>
          </div>
        </div>

        <!-- Mot de passe manuel (si pas auto-généré) -->
        <div v-if="!autoGeneratePassword">
          <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mot de passe *
          </label>
          <div class="relative">
            <input
              id="password"
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              class="input pr-10"
              :class="{ 'input-error': errors.password }"
              placeholder="Mot de passe sécurisé"
              required
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
              title="Afficher/masquer le mot de passe"
            >
              <EyeIcon v-if="!showPassword" class="h-5 w-5 text-gray-400" />
              <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
            </button>
          </div>
          <p v-if="errors.password" class="mt-1 text-sm text-red-600 dark:text-red-400">
            {{ errors.password }}
          </p>
          
          <!-- Indicateur de force du mot de passe -->
          <PasswordStrengthMeter 
            v-if="formData.password" 
            :password="formData.password"
            class="mt-2"
          />
        </div>

        <!-- Boutons d'action -->
        <div class="flex items-center justify-between pt-6">
          <RouterLink to="/" class="btn-secondary">
            Annuler
          </RouterLink>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="btn-primary relative"
          >
            <span v-if="!isSubmitting">Créer l'utilisateur</span>
            <span v-else class="flex items-center">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Création...
            </span>
          </button>
        </div>
      </form>
    </div>

    <!-- Modal de succès avec révélation de password et QR code -->
    <UserCreatedModal
      v-if="showSuccessModal"
      :user="createdUser"
      :password="generatedPassword"
      :qr-code="qrCodeUrl"
      @close="handleCloseModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import { z } from 'zod'
import { toast } from 'vue-sonner'
import confetti from 'canvas-confetti'
import { useMainStore } from '@/stores'
import type { CreateUserData, User } from '@/types'
import PasswordStrengthMeter from '@/components/forms/PasswordStrengthMeter.vue'
import UserCreatedModal from '@/components/modals/UserCreatedModal.vue'

const router = useRouter()
const store = useMainStore()

// État du formulaire
const formData = reactive<CreateUserData>({
  name: '',
  email: '',
  role: 'user',
  password: '',
})

const autoGeneratePassword = ref(true)
const generate2FA = ref(true)
const showPassword = ref(false)
const isSubmitting = ref(false)
const errors = ref<Record<string, string>>({})
const generationStatus = ref({
  password: false,
  twoFA: false
})

// État modal de succès
const showSuccessModal = ref(false)
const createdUser = ref<User | null>(null)
const generatedPassword = ref('')
const qrCodeUrl = ref('')

// Schéma de validation Zod
const createUserSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s-']+$/, 'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes'),
  
  email: z.string()
    .email('Adresse email invalide')
    .max(100, 'L\'email ne peut pas dépasser 100 caractères'),
  
  role: z.enum(['user', 'moderator', 'admin'], {
    errorMap: () => ({ message: 'Rôle invalide' }),
  }),
  
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/(?=.*[a-z])/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/(?=.*[A-Z])/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/(?=.*\d)/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(/(?=.*[@$!%*?&])/, 'Le mot de passe doit contenir au moins un caractère spécial')
    .optional(),
})

// Génération de mot de passe sécurisé
const generateSecurePassword = (): string => {
  const length = 16
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$!%*?&'
  const mandatoryChars = ['a', 'A', '1', '@'] // Au moins un de chaque type
  
  let password = mandatoryChars.join('')
  
  for (let i = password.length; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  
  // Mélanger les caractères
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

// Validation en temps réel
watch(formData, () => {
  errors.value = {}
}, { deep: true })

// Génération du QR code pour l'authentification
const generateQRCode = async (user: User, password: string): Promise<string> => {
  try {
    const QRCode = await import('qrcode')
    const qrData = {
      service: 'FaaS Dashboard',
      user: user.email,
      password: password,
      timestamp: Date.now(),
    }
    
    return await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
  } catch (error) {
    console.error('Erreur génération QR code:', error)
    return ''
  }
}

// Soumission du formulaire
const handleSubmit = async () => {
  try {
    isSubmitting.value = true
    errors.value = {}

    // Génération auto du mot de passe si activée
    if (autoGeneratePassword.value) {
      formData.password = generateSecurePassword()
      generatedPassword.value = formData.password
    } else {
      generatedPassword.value = formData.password || ''
    }

    // Validation avec Zod
    const validatedData = createUserSchema.parse(formData)

    // Création de l'utilisateur
    const newUser = await store.createUser({
      name: validatedData.name,
      email: validatedData.email,
      role: validatedData.role,
    })

    createdUser.value = newUser

    // Génération du QR code (async, loading lazy)
    generateQRCode(newUser, generatedPassword.value).then(qrUrl => {
      qrCodeUrl.value = qrUrl
    })

    // Animation confetti de succès (chargée dynamiquement)
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })

    // Affichage modal de succès
    showSuccessModal.value = true

    toast.success('Utilisateur créé avec succès!')

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      // Erreurs de validation Zod
      error.errors.forEach(err => {
        if (err.path.length > 0) {
          errors.value[err.path[0] as string] = err.message
        }
      })
      toast.error('Veuillez corriger les erreurs dans le formulaire')
    } else {
      // Autres erreurs (API, etc.)
      toast.error('Erreur lors de la création de l\'utilisateur')
      console.error('Erreur création utilisateur:', error)
    }
  } finally {
    isSubmitting.value = false
  }
}

// Fermeture de la modal de succès
const handleCloseModal = () => {
  showSuccessModal.value = false
  
  // Réinitialiser le formulaire
  Object.assign(formData, {
    name: '',
    email: '',
    role: 'user',
    password: '',
  })
  
  autoGeneratePassword.value = true
  generatedPassword.value = ''
  qrCodeUrl.value = ''
  
  // Retourner au dashboard
  router.push('/')
}
</script> 