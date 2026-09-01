import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// A relative base makes the build work unchanged from the project page at
// /shutTheCube/, from a custom domain at /, and from `vite preview`.
const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)))

export default defineConfig({
  base: './',
  plugins: [
    vue(),
    tailwindcss(),
    // Precache the whole app so it loads instantly and plays with no network.
    // The manifest already lives in public/static, so none is generated here.
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false,
      injectRegister: null,
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,mp3,webmanifest}'],
        cleanupOutdatedCaches: true,
        /*
         * No navigateFallback on purpose. The game has no client-side router,
         * so there are no routes to fall back for — but the fallback applies to
         * every navigation, so any URL missing from a visitor's cached
         * precache manifest silently rendered the game instead. A newly added
         * page did exactly that: privacy.html served the board to anyone whose
         * service worker predated it, and an unknown URL never 404'd at all.
         */
        navigateFallback: null
      }
    })
  ],
  define: { __APP_VERSION__: JSON.stringify(version) },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  test: {
    environment: 'jsdom',
    include: ['test/**/*.spec.js']
  }
})
