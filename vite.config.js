import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// A relative base makes the build work unchanged from the project page at
// /shutTheCube/, from a custom domain at /, and from `vite preview`.
const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)))

export default defineConfig({
  base: './',
  plugins: [vue(), tailwindcss()],
  define: { __APP_VERSION__: JSON.stringify(version) },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  test: {
    environment: 'jsdom',
    include: ['test/**/*.spec.js']
  }
})
