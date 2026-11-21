<script setup>
import { computed, onUnmounted, ref } from 'vue'
import { useGameStore } from '@/stores/game'
import { useMatchStore } from '@/stores/match'
import { useStatsStore } from '@/stores/stats'
import { isMuted, setMuted } from '@/services/sound'
import { useTweenedNumber } from '@/composables/useTweenedNumber'
import AppIcon from './AppIcon.vue'

const game = useGameStore()
const match = useMatchStore()
const stats = useStatsStore()

const muted = ref(isMuted())
const toggleMute = () => {
  muted.value = !muted.value
  setMuted(muted.value)
}

/*
 * Restart and Leave both throw a game away, and both sit one tap from the
 * board, so mid-game they arm on the first tap and fire on the second.
 * An untouched game (or a finished one) still leaves in one tap.
 */
const armed = ref('')
let armTimer = 0
const inProgress = computed(() => game.numberPlay > 0 && !game.isFinished)
const guarded = (which, fn) => {
  if (!inProgress.value && !(which === 'menu' && match.active)) return fn()
  if (armed.value === which) {
    clearTimeout(armTimer)
    armed.value = ''
    return fn()
  }
  armed.value = which
  clearTimeout(armTimer)
  armTimer = setTimeout(() => (armed.value = ''), 2500)
}
onUnmounted(() => clearTimeout(armTimer))

const toMenu = () =>
  guarded('menu', () => {
    game.isVisible = false
    match.reset()
  })
const doRestart = () => guarded('restart', () => game.restart())

const kind = computed(() =>
  match.active ? 'Pass & play' : game.isDaily ? 'Daily' : 'Free play'
)

/*
 * The chase: the gap to your best, counting down as tiles are banked. Only
 * once there is a best to chase, and only solo, since a pass-and-play match
 * already has an opponent.
 */
const best = computed(() => stats.bestFor(game.modeKey))
const chase = computed(() => {
  if (match.active || !best.value || game.state === 'isStart' || game.isFinished) return ''
  const gap = best.value - game.sumTilesTaken
  return gap > 0 ? `${gap} to beat` : gap === 0 ? 'level with best' : `${-gap} past best`
})
const sub = computed(() => {
  if (armed.value === 'menu') return 'Tap again to leave'
  if (armed.value === 'restart') return 'Tap again to restart'
  // Pass and play has the longest title, so there the mode moves down a line.
  const lead = match.active ? `${game.mode.label} · ` : ''
  if (game.numberPlay === 0) return lead + (best.value && !match.active ? `Best ${best.value}` : 'Ready')
  return lead + (chase.value ? `Roll ${game.numberPlay} · ${chase.value}` : `Roll ${game.numberPlay}`)
})

/* At the hand-over, Player 2 has not played yet, so the first score stays hidden. */
const scoreHidden = computed(() => match.active && match.stage === 'p1' && game.isFinished)
const shown = useTweenedNumber(
  computed(() => game.sumTilesTaken),
  400
)
</script>

<template>
  <header class="bar">
    <div class="end">
      <button
        type="button"
        class="chip"
        :class="{ armed: armed === 'menu' }"
        :aria-label="armed === 'menu' ? 'Tap again to leave the game' : 'Back to menu'"
        @click="toMenu"
      >
        <AppIcon name="close" />
      </button>
      <button
        type="button"
        class="chip"
        :class="{ armed: armed === 'restart' }"
        :aria-label="armed === 'restart' ? 'Tap again to restart this game' : 'Restart this game'"
        @click="doRestart"
      >
        <AppIcon name="refresh" />
      </button>
    </div>

    <div class="brand">
      <p class="name display">{{ match.active ? kind : `${kind} · ${game.mode.label}` }}</p>
      <p class="sub" :class="{ warn: armed }" aria-live="polite">{{ sub }}</p>
    </div>

    <div class="end right">
      <button
        type="button"
        class="chip"
        :aria-label="muted ? 'Turn sound on' : 'Turn sound off'"
        :aria-pressed="muted"
        @click="toggleMute"
      >
        <AppIcon :name="muted ? 'soundOff' : 'sound'" />
      </button>
      <p class="score" :class="{ hidden: scoreHidden }">
        <strong class="num">{{ shown }}</strong>
        <span>points</span>
      </p>
    </div>
  </header>
</template>

<style scoped>
.bar {
  flex: none;
  display: grid;
  grid-template-columns: 1fr minmax(0, auto) 1fr;
  align-items: center;
  gap: 0.5rem;
  padding: max(0.5rem, env(safe-area-inset-top)) 0.75rem 0.375rem;
}
.end {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}
.end.right {
  justify-content: flex-end;
}

.brand {
  min-width: 0;
  text-align: center;
}
.name {
  margin: 0;
  font-weight: 600;
  font-size: 1.0625rem;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sub {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--muted);
  white-space: nowrap;
}
.sub.warn {
  color: var(--bad);
  font-weight: 600;
}

.chip {
  width: 2.75rem;
  height: 2.75rem;
  flex: none;
  display: grid;
  place-items: center;
  color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.05rem;
  transition: border-color 0.12s;
}
.chip:hover {
  border-color: var(--line-strong);
}
.chip[aria-pressed='true'] {
  color: var(--muted);
}
.chip.armed {
  color: var(--bad);
  border-color: var(--bad);
}

.score {
  margin: 0;
  min-width: 2.75rem;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.05;
}
.score strong {
  font-weight: 700;
  font-size: 1.375rem;
}
.score span {
  font-size: 0.75rem;
  color: var(--muted);
}
.score.hidden {
  visibility: hidden;
}

/* A 320px phone cannot hold four round buttons and a title: sound gives way. */
@media (max-width: 350px) {
  .end.right .chip {
    display: none;
  }
}
</style>
