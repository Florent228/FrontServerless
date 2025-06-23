import { ref, watch } from 'vue'
import { useStorage } from '@vueuse/core'

export const useDarkMode = () => {
  const isDark = useStorage('theme', getInitialTheme())
  const systemDark = ref(false)

  // Détecter le thème système initial
  function getInitialTheme(): boolean {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  }

  // Appliquer le thème
  const applyTheme = (dark: boolean) => {
    if (typeof document !== 'undefined') {
      if (dark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }

  // Basculer le thème
  const toggleDarkMode = () => {
    isDark.value = !isDark.value
  }

  // Utiliser le thème système
  const useSystemTheme = () => {
    isDark.value = systemDark.value
  }

  // Initialiser le dark mode
  const initDarkMode = () => {
    // Écouter les changements du thème système
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      systemDark.value = mediaQuery.matches
      
      mediaQuery.addEventListener('change', (e) => {
        systemDark.value = e.matches
      })
    }

    // Appliquer le thème initial
    applyTheme(isDark.value)

    // Surveiller les changements de thème
    watch(isDark, (newValue) => {
      applyTheme(newValue)
    }, { immediate: true })
  }

  return {
    isDark,
    systemDark,
    toggleDarkMode,
    useSystemTheme,
    initDarkMode,
  }
} 