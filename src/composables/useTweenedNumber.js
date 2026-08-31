import { onUnmounted, ref, watch } from 'vue'

const easeOutQuad = (t) => t * (2 - t)

/**
 * A ref that eases toward `source` whenever it changes.
 *
 * Replaces the `tween` package (tween.js 0.9, unmaintained since 2016), which
 * was only ever used to count the score and dice up.
 */
export function useTweenedNumber(source, duration = 500, onArrive) {
  const displayed = ref(0)
  let frame = null

  const stop = () => {
    if (frame !== null) cancelAnimationFrame(frame)
    frame = null
  }

  const reducedMotion =
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

  const run = (from, to) => {
    stop()
    if (reducedMotion || from === to) {
      displayed.value = to
      onArrive?.()
      return
    }
    const started = performance.now()
    const step = (now) => {
      const progress = Math.min((now - started) / duration, 1)
      displayed.value = Math.round(from + (to - from) * easeOutQuad(progress))
      if (progress < 1) {
        frame = requestAnimationFrame(step)
      } else {
        frame = null
        onArrive?.()
      }
    }
    frame = requestAnimationFrame(step)
  }

  watch(source, (to, from) => run(from ?? 0, to ?? 0), { immediate: true })
  onUnmounted(stop)

  return displayed
}
