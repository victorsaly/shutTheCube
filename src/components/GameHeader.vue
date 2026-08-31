<script setup>
import { useGameStore } from '@/stores/game'
import { useStatsStore } from '@/stores/stats'
import AppIcon from './AppIcon.vue'
import TweenedNumber from './TweenedNumber.vue'

const game = useGameStore()
const stats = useStatsStore()
</script>

<template>
  <header class="bar">
    <button type="button" class="chip" aria-label="Choose a game" @click="game.isVisible = false">
      <AppIcon name="home" />
    </button>

    <div class="readout play">
      <TweenedNumber compact title="Play" :value="game.numberPlay" />
    </div>

    <div class="brand">
      <img src="../assets/Logo_STB.png" alt="Shut The Cube" />
      <p class="mode">
        {{ game.mode.label }}
        <span v-if="stats.bestFor(game.modeKey)">· best {{ stats.bestFor(game.modeKey) }}</span>
      </p>
    </div>

    <div class="readout total">
      <TweenedNumber compact title="Total" :value="game.sumTilesTaken" />
    </div>

    <button type="button" class="chip chip-blue" aria-label="Restart game" @click="game.restart()">
      <AppIcon name="close" />
    </button>
  </header>
</template>

<style scoped>
.bar {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
  padding: max(0.35rem, env(safe-area-inset-top)) 0.5rem 0.25rem;
}
.readout {
  flex: 1;
  min-width: 0;
}
.brand {
  flex: none;
}
.brand img {
  max-height: 26px;
  display: block;
  margin: 0 auto;
}
.mode {
  margin: 2px 0 0;
  color: #fff;
  font-size: 11px;
  opacity: 0.9;
  white-space: nowrap;
}
.chip {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.3rem;
  height: 2.1rem;
  color: #22292f;
  background: #51d88a;
  border: 0;
  border-bottom: 4px solid #22292f;
  border-radius: 0 0 0.25rem 0.25rem;
  cursor: pointer;
  font-size: 1rem;
}
.chip-blue {
  background: #6cb2eb;
}
.chip:focus-visible {
  outline: 3px solid #16351f;
  outline-offset: 2px;
}

/* On the narrowest phones the logo is the first thing to go. */
@media (max-width: 360px) {
  .brand img {
    display: none;
  }
}
</style>
