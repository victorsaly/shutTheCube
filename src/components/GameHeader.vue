<script setup>
import { useGameStore } from '@/stores/game'
import { useScoresStore } from '@/stores/scores'
import AppIcon from './AppIcon.vue'
import TweenedNumber from './TweenedNumber.vue'

const game = useGameStore()
const scores = useScoresStore()
</script>

<template>
  <ul class="list-reset flex justify-between w-full items-center mb-2">
    <li class="w-12">
      <button type="button" class="chip" aria-label="Choose a game" @click="game.isVisible = false">
        <AppIcon name="home" />
      </button>
    </li>
    <li style="color: greenyellow">
      <TweenedNumber compact title="Play" :value="game.numberPlay" />
    </li>
    <li class="flex-grow" id="logo">
      <img src="../assets/Logo_STB.png" alt="Shut The Cube" style="max-height: 30px" />
    </li>
    <li style="color: yellow">
      <TweenedNumber compact title="Total Points" :value="game.sumTilesTaken" />
    </li>
    <li class="w-12 mr-2">
      <button type="button" class="chip chip-blue" aria-label="Restart game" @click="game.restart()">
        <AppIcon name="close" />
      </button>
    </li>
  </ul>
  <p v-if="scores.bestFor(game.rows) > 0" class="best">
    <AppIcon name="trophy" /> Best: {{ scores.bestFor(game.rows) }}
  </p>
</template>

<style scoped>
.chip {
  display: inline-block;
  width: 2.5rem;
  padding: 0.5rem;
  margin: 0.5rem;
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
  outline: 2px solid #2779bd;
  outline-offset: 2px;
}
.best {
  color: #fff;
  font-size: 12px;
  margin: 0 0 4px;
  opacity: 0.85;
}
@media only screen and (max-device-width: 330px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait) {
  #logo {
    display: none !important;
  }
}
</style>
