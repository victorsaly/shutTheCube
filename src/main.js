import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { registerSW } from 'virtual:pwa-register'
import App from './App.vue'
import './styles/main.css'

createApp(App).use(createPinia()).mount('#app-root')

// Precached offline; a new build takes over on the next visit.
registerSW({ immediate: true })
