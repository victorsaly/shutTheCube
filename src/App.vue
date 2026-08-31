<script setup>
import { onMounted, ref } from 'vue'
import { useGameStore } from '@/stores/game'
import { useScoresStore } from '@/stores/scores'
import { isMobile } from '@/services/gameServices'
import { useInstallPrompt } from '@/composables/useInstallPrompt'
import GameBoard from '@/components/GameBoard.vue'
import GameHeader from '@/components/GameHeader.vue'

const game = useGameStore()
const scores = useScoresStore()
const { canInstall, prompt } = useInstallPrompt()
const onMobile = ref(false)
const version = __APP_VERSION__

onMounted(() => {
  onMobile.value = isMobile()
})

const start = (rows) => {
  game.newGame(rows)
  game.isVisible = true
}
</script>

<template>
  <div
    class="w-full h-screen bg-gradient-brand mx-auto relative"
    :class="{
      isMobile: onMobile && game.rows > 1,
      shutTheBox: game.rows === 1,
      container: !onMobile
    }"
  >
    <div id="warning-message">
      <div class="w-full h-screen absolute flex items-center justify-center bg-green-light">
        <div class="text-center">
          <div class="mb-4">
            <img src="./assets/Logo_STB.png" alt="Shut The Cube" style="max-height: 30px" />
          </div>
          <p>This app is only playable in portrait.</p>
        </div>
      </div>
    </div>

    <div id="app">
      <div :class="{ header: game.rows > 2 }">
        <GameHeader v-if="game.isVisible" />
      </div>

      <div
        v-if="!game.isVisible"
        class="h-screen w-full absolute flex items-center justify-center bg-modal"
        style="height: calc(100% - 200px)"
      >
        <div class="bg-white rounded shadow p-8 m-4 max-w-xs max-h-full text-center">
          <div class="mb-4">
            <img src="./assets/Logo_STB.png" alt="Shut The Cube" style="max-height: 30px" />
            <span class="version">v{{ version }}</span>
          </div>
          <p class="mb-8">Select the game you want to play.</p>
          <div class="flex justify-center">
            <button type="button" class="choice" @click="start(1)">
              Shut The Box
              <small v-if="scores.bestFor(1)">best {{ scores.bestFor(1) }}</small>
            </button>
            <button type="button" class="choice ml-2" @click="start(9)">
              Shut The Cube
              <small v-if="scores.bestFor(9)">best {{ scores.bestFor(9) }}</small>
            </button>
          </div>
          <button v-if="canInstall" type="button" class="install" @click="prompt">
            Add to home screen
          </button>
        </div>
      </div>

      <Transition name="fade" mode="out-in">
        <GameBoard v-if="game.isVisible" />
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.version {
  font-size: 9px;
  position: absolute;
}
.choice {
  flex-shrink: 0;
  display: block;
  color: #fff;
  background: #4dc0b5;
  border: 0;
  border-radius: 0.25rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font: inherit;
}
.choice:hover {
  background: #38a89d;
}
.choice small {
  display: block;
  font-size: 10px;
  opacity: 0.85;
}
.install {
  margin-top: 1.5rem;
  background: none;
  border: 0;
  color: #606f7b;
  font-size: 12px;
  text-decoration: underline;
  cursor: pointer;
}
.choice:focus-visible,
.install:focus-visible {
  outline: 2px solid #2779bd;
  outline-offset: 2px;
}
</style>
