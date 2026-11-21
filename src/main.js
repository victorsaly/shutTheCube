import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { registerSW } from 'virtual:pwa-register'
// Self-hosted webfonts: the display face and the body face. No CDN, same
// policy as the Tailwind palette, and the PWA precaches them for offline.
import './styles/fonts.css'
import App from './App.vue'
import { startAnalytics } from './analytics'
import './styles/main.css'

createApp(App).use(createPinia()).mount('#app-root')

// Precached offline; a new build takes over on the next visit.
registerSW({ immediate: true })

// No-ops unless VITE_CF_BEACON is set at build time.
startAnalytics()
