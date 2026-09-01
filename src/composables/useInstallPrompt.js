import { onMounted, onUnmounted, ref } from 'vue'

/**
 * Wraps the browser's own install prompt.
 *
 * Replaces the `add-to-homescreen` package, which shipped its own instructional
 * overlay because `beforeinstallprompt` barely existed in 2018. It is well
 * supported now, so the browser can do this itself.
 */
export function useInstallPrompt() {
  const canInstall = ref(false)
  let deferred = null

  const capture = (event) => {
    event.preventDefault()
    deferred = event
    canInstall.value = true
  }

  const installed = () => {
    deferred = null
    canInstall.value = false
  }

  const prompt = async () => {
    if (!deferred) return
    deferred.prompt()
    await deferred.userChoice
    installed()
  }

  onMounted(() => {
    window.addEventListener('beforeinstallprompt', capture)
    window.addEventListener('appinstalled', installed)
  })
  onUnmounted(() => {
    window.removeEventListener('beforeinstallprompt', capture)
    window.removeEventListener('appinstalled', installed)
  })

  return { canInstall, prompt }
}
