<script setup>
import { onMounted, ref } from 'vue'
import { useGameStore } from '@/stores/game'
import { useStatsStore } from '@/stores/stats'
import { MODE_LIST } from '@/stores/modes'
import { isMobile } from '@/services/gameServices'
import { useInstallPrompt } from '@/composables/useInstallPrompt'
import AppIcon from '@/components/AppIcon.vue'
import GameBoard from '@/components/GameBoard.vue'
import GameHeader from '@/components/GameHeader.vue'
import StatsPanel from '@/components/StatsPanel.vue'

const game = useGameStore()
const stats = useStatsStore()
const { canInstall, prompt } = useInstallPrompt()
const onMobile = ref(false)
const showStats = ref(false)
const version = __APP_VERSION__

onMounted(() => {
  onMobile.value = isMobile()
})

const start = (key) => {
  game.newGame(key)
  game.isVisible = true
}
</script>

<template>
  <div class="shell" :class="{ isMobile: onMobile, shutTheBox: game.rows === 1 }">
    <div id="warning-message">
      <div class="warning">
        <img src="./assets/Logo_STB_light.png" alt="Shut The Cube" />
        <p>This app is only playable in portrait.</p>
      </div>
    </div>

    <div id="app">
      <GameHeader v-if="game.isVisible" />

      <div v-if="!game.isVisible" class="menu-wrap">
        <div class="card">
          <div class="card-head">
            <img src="./assets/Logo_STB.png" alt="Shut The Cube" />
            <span class="version">v{{ version }}</span>
          </div>

          <StatsPanel v-if="showStats" @close="showStats = false" />

          <template v-else>
            <p class="lede">Pick a game.</p>
            <ul class="modes">
              <li v-for="mode in MODE_LIST" :key="mode.key">
                <button type="button" :class="['choice', mode.key]" @click="start(mode.key)">
                  <span class="choice-name">{{ mode.label }}</span>
                  <span class="choice-blurb">{{ mode.blurb }}</span>
                  <span v-if="stats.hasPlayed(mode.key)" class="choice-best">
                    best {{ stats.bestFor(mode.key) }}
                  </span>
                </button>
              </li>
            </ul>

            <button type="button" class="secondary" @click="showStats = true">
              <AppIcon name="trophy" /> Your record
            </button>
            <button v-if="canInstall" type="button" class="install" @click="prompt">
              Add to home screen
            </button>
          </template>
        </div>
      </div>

      <GameBoard v-if="game.isVisible" />
    </div>
  </div>
</template>

<style scoped>
/*
 * An explicit height, not just a minimum: size containment on .board-area can
 * only resolve its block axis if the flex chain above it is definite. With
 * min-height alone `100cqh` resolves to 0 and the board collapses.
 */
.shell {
  height: 100dvh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
#app {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  width: 100%;
  max-width: 46rem;
  margin: 0 auto;
}

.warning {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: var(--ground-2);
  color: var(--ink);
}
.warning img {
  max-height: 30px;
}

.menu-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  overflow-y: auto;
}
.card {
  background: #f4f7f5;
  color: #16241d;
  border-radius: 0.7rem;
  box-shadow: 0 18px 44px rgb(0 0 0 / 45%);
  padding: 1.5rem;
  width: 100%;
  max-width: 22rem;
  max-height: 100%;
  overflow-y: auto;
}
.card-head {
  margin-bottom: 1rem;
}
.card-head img {
  max-height: 30px;
}
.version {
  font-size: 9px;
  position: absolute;
  color: #8795a1;
}
.lede {
  margin: 0 0 1rem;
  color: #606f7b;
  font-size: 0.9rem;
}

.modes {
  list-style: none;
  margin: 0 0 1rem;
  padding: 0;
  display: grid;
  gap: 0.5rem;
}
.choice {
  width: 100%;
  display: block;
  text-align: left;
  color: #fff;
  border: 0;
  border-radius: 0.4rem;
  padding: 0.6rem 0.75rem;
  cursor: pointer;
  font: inherit;
  position: relative;
}
.choice.beginner {
  background: #38a89d;
}
.choice.medium {
  background: #2779bd;
}
.choice.ninja {
  background: #c3251f;
}
.choice:hover {
  filter: brightness(1.08);
}
.choice-name {
  display: block;
  font-weight: 700;
}
.choice-blurb {
  display: block;
  font-size: 0.72rem;
  opacity: 0.9;
  margin-top: 1px;
}
.choice-best {
  position: absolute;
  top: 0.6rem;
  right: 0.75rem;
  font-size: 0.68rem;
  background: rgb(255 255 255 / 22%);
  border-radius: 999px;
  padding: 0.1rem 0.4rem;
}

.secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: #dae1e7;
  color: #22292f;
  border: 0;
  border-radius: 0.4rem;
  padding: 0.45rem 0.8rem;
  font: inherit;
  font-size: 0.82rem;
  cursor: pointer;
}
.install {
  display: block;
  margin: 1rem auto 0;
  background: none;
  border: 0;
  color: #606f7b;
  font-size: 0.75rem;
  text-decoration: underline;
  cursor: pointer;
}
.choice:focus-visible,
.secondary:focus-visible,
.install:focus-visible {
  outline: 3px solid #22292f;
  outline-offset: 2px;
}
</style>
