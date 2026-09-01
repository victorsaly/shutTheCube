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
    <!--
      Both end controls are labelled. The restart control used to be an X,
      which reads as "close" next to a home button that already goes back.
    -->
    <button type="button" class="chip" @click="game.isVisible = false">
      <AppIcon name="home" />
      <span>Menu</span>
    </button>

    <div class="slot">
      <TweenedNumber compact title="Play" :value="game.numberPlay" />
    </div>

    <div class="brand">
      <img src="../assets/Logo_STB_light.png" alt="Shut The Cube" />
      <p class="mode">
        {{ game.mode.label }}
        <span v-if="stats.bestFor(game.modeKey)">· best {{ stats.bestFor(game.modeKey) }}</span>
      </p>
    </div>

    <div class="slot">
      <TweenedNumber compact title="Total" :value="game.sumTilesTaken" />
    </div>

    <button type="button" class="chip" @click="game.restart()">
      <AppIcon name="refresh" />
      <span>Restart</span>
    </button>
  </header>
</template>

<style scoped>
/* Fixed, equal end columns keep the logo on the centre line. */
.bar {
  flex: none;
  display: grid;
  grid-template-columns: 3.4rem 1fr auto 1fr 3.4rem;
  align-items: center;
  gap: 0.4rem;
  padding: max(0.4rem, env(safe-area-inset-top)) 0.5rem 0.2rem;
}
.slot {
  min-width: 0;
  display: flex;
  justify-content: center;
}
.brand img {
  max-height: 24px;
  display: block;
  margin: 0 auto;
}
.mode {
  margin: 2px 0 0;
  color: var(--ink-dim);
  font-size: 11px;
  white-space: nowrap;
}

.chip {
  display: grid;
  justify-items: center;
  gap: 1px;
  padding: 0.3rem 0.15rem;
  color: var(--ink);
  background: rgb(255 255 255 / 10%);
  border: 1px solid rgb(255 255 255 / 16%);
  border-radius: 0.4rem;
  cursor: pointer;
  font: inherit;
  font-size: 0.95rem;
}
.chip span {
  font-size: 0.58rem;
  letter-spacing: 0.02em;
  color: var(--ink-dim);
}
.chip:hover {
  background: rgb(255 255 255 / 16%);
}
.chip:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}

@media (max-width: 360px) {
  .brand img {
    display: none;
  }
}
</style>
