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
        navigateFallback: 'index.html'
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
