import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/css/main.css'

// Plugins et configurations
import { MotionPlugin } from '@vueuse/motion'
import { setupAxios } from './plugins/axios'
import { registerSW } from 'virtual:pwa-register'

// Configuration du Service Worker
const updateSW = registerSW({
  onNeedRefresh() {
    // Afficher une notification pour rafraîchir l'app
    console.log('App update available')
  },
  onOfflineReady() {
    console.log('App ready to work offline')
  },
})

const app = createApp(App)
const pinia = createPinia()

// Configuration Axios
setupAxios()

app.use(pinia)
app.use(router)
app.use(MotionPlugin)

app.mount('#app') 