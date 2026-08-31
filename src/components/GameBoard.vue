<script setup>
import { computed, onMounted, ref } from 'vue'
import { useGameStore } from '@/stores/game'
import { isMobile } from '@/services/gameServices'
import { useShake } from '@/composables/useShake'
import AppIcon from './AppIcon.vue'
import DiceFace from './DiceFace.vue'
import SelectedTiles from './SelectedTiles.vue'
import TileRow from './TileRow.vue'
import TweenedNumber from './TweenedNumber.vue'

const game = useGameStore()
const toast = ref('')

const BUTTON = {
  isNext: { message: 'ROLL DICE', colour: 'action-green', icon: 'arrowRight' },
  isOver: { message: 'GAME OVER', colour: 'action-red', icon: 'close' },
  isStart: { message: 'START GAME', colour: 'action-green', icon: 'arrowRight' },
  isWin: { message: 'SHUT THE BOX', colour: 'action-green', icon: 'check' }
}
const button = computed(() => BUTTON[game.state] ?? null)

let clickAudio = null
const playClick = () => {
  try {
    clickAudio ??= new Audio(`${import.meta.env.BASE_URL}static/click.mp3`)
    clickAudio.currentTime = 0
    clickAudio.play().catch(() => {})
  } catch {
    // Audio is a nicety; never let it break a move.
  }
}

const advance = () => {
  if (game.isLoading) return
  game.isLoading = true
  switch (game.state) {
    case 'isStart':
      game.startGame()
      break
    case 'isNext':
      game.nextTurn()
      break
    case 'isOver':
    case 'isWin':
      game.restart()
      break
  }
  game.isLoading = false
}

const shake = useShake(advance)

onMounted(async () => {
  if (!isMobile()) return
  if (shake.needsPermission()) {
    // iOS will only grant motion access from a user gesture, so the first tap
    // on the action button is what unlocks shake-to-roll.
    return
  }
  toast.value = 'Shake it to roll the dice'
  setTimeout(() => (toast.value = ''), 2500)
})

const onAction = async () => {
  if (shake.needsPermission() && (await shake.requestPermission())) shake.start()
  advance()
}
</script>

<template>
  <div class="Game">
    <div class="tile-position">
      <TileRow
        v-for="(row, index) in game.tiles"
        :key="index"
        :tiles="row"
        :row-index="index"
        :all-tiles="game.tiles"
        :play-click="playClick"
      />
    </div>

    <ul class="list-position list-reset flex justify-between w-full items-center mb-2">
      <li class="w-12" />
      <li style="color: greenyellow">
        <TweenedNumber v-if="game.rows > 2" title="Bonus" :value="game.gameBonus" />
      </li>
      <li class="flex-grow">
        <div id="dice" class="unselectable" :class="{ blocked: game.diceInUse }">
          <DiceFace v-for="die in game.dice" :key="die.id" :value="die.number" />
        </div>
      </li>
      <li style="color: yellow">
        <TweenedNumber v-if="game.rows > 2" title="Points" :value="game.gamePoints" />
      </li>
      <li class="w-12 mr-2" />
    </ul>

    <Transition name="fade" mode="out-in">
      <button
        v-if="button && !game.isLoading"
        :key="game.state"
        type="button"
        class="unselectable no-outline flex mb-2 border-b-4 border-black action-button animated"
        :class="{ shake: game.state === 'isOver' }"
        @click="onAction"
      >
        <span class="action-icon"><AppIcon :name="button.icon" :spin="game.isLoading" /></span>
        <span class="action-label flex-grow" :class="button.colour">{{ button.message }}</span>
      </button>
      <div v-else class="game">
        <SelectedTiles />
      </div>
    </Transition>

    <Transition name="fade">
      <p v-if="toast" class="toast" role="status">{{ toast }}</p>
    </Transition>
  </div>
</template>

<style scoped>
.unselectable {
  -webkit-user-select: none;
  user-select: none;
}
.tile-position {
  z-index: 20;
  position: relative;
}
.list-position {
  z-index: 0;
  position: relative;
}
.blocked {
  opacity: 0.5;
}
#dice {
  color: #222;
}

.action-button {
  max-width: 200px;
  margin: 0 auto 0.5rem;
  padding: 0;
  border: 0;
  border-bottom: 4px solid #22292f;
  border-radius: 0 0 0.25rem 0.25rem;
  background: #fff382;
  cursor: pointer;
  font: inherit;
  overflow: hidden;
}
.action-icon,
.action-label {
  display: block;
  padding: 0.5rem 0.5rem 0.25rem;
  color: #22292f;
}
.action-green {
  background: #51d88a;
}
.action-red {
  background: #ef5753;
}
.action-button:active {
  transform: translate(0, 1px);
  border-bottom-width: 1px;
}
.no-outline:focus-visible {
  outline: 2px solid #2779bd;
  outline-offset: 2px;
}

.toast {
  color: #fff;
  background: rgb(34 41 47 / 80%);
  border-radius: 4px;
  padding: 8px 12px;
  margin: 8px auto;
  max-width: 260px;
  font-size: 14px;
}

@media only screen and (max-device-width: 320px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait) {
  .list-position {
    max-height: 45px;
  }
  .shutTheBox .list-position {
    max-height: 70px;
  }
}
</style>
