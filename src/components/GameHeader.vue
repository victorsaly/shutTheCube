<script setup>
import { ref } from 'vue'
import { useGameStore } from '@/stores/game'
import { useStatsStore } from '@/stores/stats'
import { isMuted, setMuted } from '@/services/sound'
import AppIcon from './AppIcon.vue'
import BrandMark from './BrandMark.vue'
import TweenedNumber from './TweenedNumber.vue'

const game = useGameStore()
const stats = useStatsStore()

const muted = ref(isMuted())
const toggleMute = () => {
  muted.value = !muted.value
  setMuted(muted.value)
}
</script>

<template>
  <header class="bar">
    <!-- Fixed, equal end columns keep the brand on the centre line. -->
    <div class="end">
      <button type="button" class="chip" title="Back to menu" aria-label="Back to menu"
        @click="game.isVisible = false">
        <AppIcon name="home" />
      </button>
    </div>

    <div class="slot">
      <TweenedNumber compact class="readout-play" title="Play" :value="game.numberPlay" />
    </div>

    <div class="brand">
      <p class="name display"><BrandMark :size="20" /> Shut The Cube</p>
      <p class="mode micro">
        {{ game.mode.label }}
        <span v-if="stats.bestFor(game.modeKey)" class="best">
          · best {{ stats.bestFor(game.modeKey) }}
        </span>
      </p>
    </div>

    <div class="slot">
      <TweenedNumber compact class="readout-total" title="Total" :value="game.sumTilesTaken" />
    </div>

    <div class="end right">
      <button type="button" class="chip" :title="muted ? 'Sound off' : 'Sound on'"
        :aria-label="muted ? 'Turn sound on' : 'Turn sound off'" :aria-pressed="muted"
        @click="toggleMute">
        <AppIcon :name="muted ? 'soundOff' : 'sound'" />
      </button>
      <!-- Labelled restart, not an X: an X reads as "close" next to a home
           button that already goes back. -->
      <button type="button" class="chip" title="Restart" aria-label="Restart this game"
        @click="game.restart()">
        <AppIcon name="refresh" />
      </button>
    </div>
  </header>
</template>

<style scoped>
.bar {
  flex: none;
  display: grid;
  grid-template-columns: 5.2rem 1fr minmax(0, auto) 1fr 5.2rem;
  align-items: center;
  gap: 0.4rem;
  padding: max(0.4rem, env(safe-area-inset-top)) 0.6rem 0.2rem;
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
