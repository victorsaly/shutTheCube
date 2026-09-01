<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

/**
 * Box-shut celebration: a one-shot burst of confetti in the tile faces'
 * own pastels. Mount it and it plays once (~2.2s) and goes quiet; honours
 * prefers-reduced-motion by doing nothing at all.
 */
const COLORS = ['#a2f5bf', '#6cb2eb', '#fff382', '#d6bbfc', '#7ff0ae', '#ffe36b']

const cv = ref(null)
let raf = 0

onMounted(() => {
  const canvas = cv.value
  if (!canvas) return
  // Guards double as jsdom safety: no matchMedia, no 2d context, no party.
  if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }
  const g = canvas.getContext?.('2d')
  if (!g) return
  const DPR = Math.min(devicePixelRatio || 1, 2)
  const W = (canvas.width = innerWidth * DPR)
  const H = (canvas.height = innerHeight * DPR)

  const ps = Array.from({ length: 150 }, () => ({
    x: W * (0.2 + Math.random() * 0.6),
    y: -20 * DPR,
    vx: (Math.random() - 0.5) * 9 * DPR,
    vy: (2 + Math.random() * 7) * DPR,
    s: (5 + Math.random() * 7) * DPR,
    a: Math.random() * Math.PI,
    va: (Math.random() - 0.5) * 0.3,
    c: COLORS[Math.floor(Math.random() * COLORS.length)]
  }))

  const t0 = performance.now()
  const step = (t) => {
    const life = (t - t0) / 2200
    if (life > 1) {
      g.clearRect(0, 0, W, H)
      return
    }
    raf = requestAnimationFrame(step)
    g.clearRect(0, 0, W, H)
    g.globalAlpha = life < 0.7 ? 1 : 1 - (life - 0.7) / 0.3
    for (const p of ps) {
      p.vy += 0.18 * DPR
      p.vx *= 0.99
      p.x += p.vx
      p.y += p.vy
      p.a += p.va
      g.save()
      g.translate(p.x, p.y)
      g.rotate(p.a)
      g.fillStyle = p.c
      g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2)
      g.restore()
    }
    g.globalAlpha = 1
  }
  raf = requestAnimationFrame(step)
})

onUnmounted(() => cancelAnimationFrame(raf))
</script>

<template>
  <canvas ref="cv" class="confetti" aria-hidden="true"></canvas>
</template>

<style scoped>
.confetti {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 30;
  pointer-events: none;
}
</style>
