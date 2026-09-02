<script setup>
import { computed, onUnmounted, ref } from 'vue'
import { useGameStore } from '@/stores/game'
import { useMatchStore } from '@/stores/match'
import { useStatsStore } from '@/stores/stats'
import { isMuted, setMuted } from '@/services/sound'
import AppIcon from './AppIcon.vue'
import BrandMark from './BrandMark.vue'
import TweenedNumber from './TweenedNumber.vue'

const game = useGameStore()
const match = useMatchStore()
const stats = useStatsStore()

const muted = ref(isMuted())
const toggleMute = () => {
  muted.value = !muted.value
  setMuted(muted.value)
}

/*
 * Restart and Menu both throw a game away, and both sit one tap from the
 * board — so mid-game they arm on the first tap and fire on the second.
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

/*
 * The chase.
 *
 * A personal best sitting in the corner is a fact; the gap to it, counting
 * down as tiles are banked, is a reason to keep going. It appears only once
 * there is a best to chase, and only in a solo game — a pass-and-play match
 * is its own contest and already has an opponent.
 */
const best = computed(() => stats.bestFor(game.modeKey))
const chase = computed(() => {
  if (match.active || !best.value || game.state === 'isStart') return null
  const gap = best.value - game.sumTilesTaken
  return gap > 0
    ? { behind: true, gap, label: `${gap} to beat` }
    : { behind: false, gap: -gap, label: gap === 0 ? 'level with best' : `${-gap} past best` }
})
</script>

<template>
  <header class="bar">
    <!-- Fixed, equal end columns keep the brand on the centre line. -->
    <div class="end">
      <button type="button" class="chip" :class="{ armed: armed === 'menu' }"
        :title="armed === 'menu' ? 'Tap again to leave' : 'Back to menu'"
        :aria-label="armed === 'menu' ? 'Tap again to leave the game' : 'Back to menu'"
        @click="toMenu">
        <AppIcon name="home" />
      </button>
      <span v-if="armed === 'menu'" class="confirm-note left" aria-live="polite">Tap again</span>
    </div>

    <div class="slot">
      <TweenedNumber compact class="readout-play" title="Play" :value="game.numberPlay" />
    </div>

    <div class="brand">
      <p class="name display"><BrandMark :size="20" /> Shut The Cube</p>
      <!-- The game opens straight onto a board, so this is how the modes,
           the daily and the boards are found. A label nobody can press is no
           use as the only way back. -->
      <button type="button" class="mode micro" :class="{ armed: armed === 'menu' }"
        :title="armed === 'menu' ? 'Tap again to leave' : 'Change mode, or see the boards'"
        @click="toMenu">
        <span v-if="game.isDaily" class="daily-tag">Daily #{{ game.dayIndex }}</span>
        {{ game.mode.label }}
        <span v-if="best && !chase" class="best">· best {{ best }}</span>
        <span class="caret" aria-hidden="true">▾</span>
      </button>
    </div>

    <div class="slot">
      <TweenedNumber compact class="readout-total" title="Total" :value="game.sumTilesTaken" />
      <!-- Live gap to your best: the number that makes the last few turns
           matter. Announced politely so it is not read out every tile. -->
      <p v-if="chase" class="chase micro" :class="{ ahead: !chase.behind }" aria-live="polite">
        <span class="num">{{ chase.label }}</span>
      </p>
    </div>

    <div class="end right">
      <button type="button" class="chip" :title="muted ? 'Sound off' : 'Sound on'"
        :aria-label="muted ? 'Turn sound on' : 'Turn sound off'" :aria-pressed="muted"
        @click="toggleMute">
        <AppIcon :name="muted ? 'soundOff' : 'sound'" />
      </button>
      <!-- Labelled restart, not an X: an X reads as "close" next to a home
           button that already goes back. -->
      <button type="button" class="chip" :class="{ armed: armed === 'restart' }"
        :title="armed === 'restart' ? 'Tap again to restart' : 'Restart'"
        :aria-label="armed === 'restart' ? 'Tap again to restart this game' : 'Restart this game'"
        @click="doRestart">
        <AppIcon name="refresh" />
      </button>
      <span v-if="armed === 'restart'" class="confirm-note right" aria-live="polite">Tap again</span>
    </div>
  </header>
</template>

<style scoped>
.bar {
  position: relative;
  flex: none;
  display: grid;
  grid-template-columns: 5.2rem 1fr minmax(0, auto) 1fr 5.2rem;
  align-items: center;
  gap: 0.4rem;
  padding: max(0.4rem, env(safe-area-inset-top)) 0.6rem 0.2rem;
}
/* The gap to your best, under the running total. Sized down and given its
   own line so it reads as a caption rather than competing with the score. */
.chase {
  margin: 2px 0 0;
  text-align: center;
  color: var(--muted);
  white-space: nowrap;
  letter-spacing: 0.04em;
  line-height: 1;
  font-size: 0.58rem;
}
.chase.ahead {
  color: var(--accent);
  font-weight: 600;
}

/* The mode line doubles as the way back to the menu. A button is inline by
   default, which put it alongside the wordmark instead of under it. */
.mode {
  display: block;
  background: none;
  border: 0;
  padding: 2px 6px;
  border-radius: 7px;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.mode:hover {
  background: rgb(234 243 238 / 8%);
}
.mode.armed {
  color: var(--bad);
}
.caret {
  opacity: 0.5;
  margin-left: 2px;
}
/* Playing the day's shared board is worth knowing while you are on it. */
.daily-tag {
  color: var(--accent);
  font-weight: 600;
  margin-right: 3px;
}

.end {
  display: flex;
  gap: 6px;
  justify-content: flex-start;
}
.end.right {
  justify-content: flex-end;
}
.slot {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.readout-play {
  --readout: var(--bone);
}
.readout-total {
  --readout: var(--sel);
}

/*
 * The centre column may shrink and the label may clip, because the alternative
 * is a nowrap label holding the column open and pushing the readouts under the
 * buttons — which is what a narrow phone used to do once a best existed.
 */
.brand {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.brand .name {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 0.02em;
  color: var(--bone);
  white-space: nowrap;
}
.mode {
  margin: 2px 0 0;
  font-size: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chip {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  color: var(--bone);
  background: rgb(9 29 22 / 55%);
  border: 1px solid var(--line);
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  transition: border-color 0.12s, background 0.12s;
}
.chip:hover {
  border-color: color-mix(in srgb, var(--accent) 75%, transparent);
  background: rgb(9 29 22 / 80%);
}
.chip[aria-pressed='true'] {
  color: var(--muted);
}
.chip.armed {
  color: var(--bad);
  border-color: var(--bad);
  animation: chip-arm 0.9s ease-in-out infinite;
}
@keyframes chip-arm {
  0%,
  100% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--bad) 45%, transparent);
  }
  50% {
    box-shadow: 0 0 0 5px color-mix(in srgb, var(--bad) 0%, transparent);
  }
}
.confirm-note {
  position: absolute;
  top: 100%;
  margin-top: 3px;
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--bad);
  white-space: nowrap;
  z-index: 7;
}
.confirm-note.left {
  left: 0.6rem;
}
.confirm-note.right {
  right: 0.6rem;
}
@media (prefers-reduced-motion: reduce) {
  .chip.armed {
    animation: none;
  }
}

/*
 * Five things do not fit across a 320px bar. The record is the one that goes:
 * it is on the menu card and again on the game-over card, while the live
 * readouts have nowhere else to be.
 */
@media (max-width: 380px) {
  .brand .name,
  .mode .best {
    display: none;
  }
  .bar {
    grid-template-columns: 4.9rem 1fr minmax(0, auto) 1fr 4.9rem;
    gap: 0.3rem;
    padding-left: 0.4rem;
    padding-right: 0.4rem;
  }
}
</style>
