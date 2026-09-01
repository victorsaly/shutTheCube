import { onMounted, onUnmounted } from 'vue'

/**
 * Fire `onShake` when the device is shaken.
 *
 * Replaces shake.js (unmaintained since 2016). It also asks for the motion
 * permission that iOS 13+ requires, which shake.js predates — meaning shake to
 * roll had silently stopped working on modern iPhones.
 */
export function useShake(onShake, { threshold = 12, timeout = 1000 } = {}) {
  let last = { x: null, y: null, z: null }
  let lastFiredAt = 0

  const handle = (event) => {
    const current = event.accelerationIncludingGravity
    if (!current) return

    if (last.x !== null) {
      const delta =
        Math.abs(current.x - last.x) + Math.abs(current.y - last.y) + Math.abs(current.z - last.z)
      const now = Date.now()
      if (delta > threshold && now - lastFiredAt > timeout) {
        lastFiredAt = now
        onShake()
      }
    }
    last = { x: current.x, y: current.y, z: current.z }
  }

  // `DeviceMotionEvent?.x` still throws on an undeclared global, so the guard
  // has to be a typeof check: without it this crashes anywhere the API is
  // missing rather than quietly doing nothing.
  const needsPermission = () =>
    typeof DeviceMotionEvent !== 'undefined' &&
    typeof DeviceMotionEvent.requestPermission === 'function'

  /** Must be called from a user gesture on iOS, or the prompt is refused. */
  const requestPermission = async () => {
    if (!needsPermission()) return true
    try {
      return (await DeviceMotionEvent.requestPermission()) === 'granted'
    } catch {
      return false
    }
  }

  const start = () => window.addEventListener('devicemotion', handle, false)
  const stop = () => window.removeEventListener('devicemotion', handle, false)

  onMounted(() => {
    if (typeof window === 'undefined') return
    if (!needsPermission()) start()
  })
  onUnmounted(stop)

  return { start, stop, requestPermission, needsPermission }
}
