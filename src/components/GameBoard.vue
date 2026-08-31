<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
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
const inPlay = computed(() => game.state === '')
const timerLow = computed(() => game.mode.turnSeconds > 0 && game.secondsLeft <= 10)

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

// ------------------------------------------------------- keyboard grid

/**
 * A roving tabindex: the board is one tab stop and the arrow keys move within
 * it. Previously every tile was tabbable, so reaching the last one took 80
 * key presses.
 */
const cursor = ref([0, 0])

const moveCursor = (dRow, dCol) => {
  const rows = game.tiles.length
  if (!rows) return
  const row = Math.min(Math.max(cursor.value[0] + dRow, 0), rows - 1)
  const cols = game.tiles[row].length
  const col = Math.min(Math.max(cursor.value[1] + dCol, 0), cols - 1)
  cursor.value = [row, col]
  nextTick(() => document.querySelector(`[data-cell="${row}-${col}"]`)?.focus())
}

const onGridKeydown = (event) => {
  const moves = {
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1]
  }
  if (moves[event.key]) {
    event.preventDefault()
    moveCursor(...moves[event.key])
  } else if (event.key === 'Home') {
    event.preventDefault()
    cursor.value = [cursor.value[0], 0]
    moveCursor(0, 0)
  } else if (event.key === 'End') {
    event.preventDefault()
    cursor.value = [cursor.value[0], game.tiles[cursor.value[0]].length - 1]
    moveCursor(0, 0)
  }
}

// Keep the cursor inside the board when the mode changes.
watch(
  () => game.tiles.length,
  () => {
    cursor.value = [0, 0]
  }
)

const onWindowKeydown = (event) => {
  if (event.target.tagName === 'INPUT' || event.metaKey || event.ctrlKey) return
  if (event.key === 'u' && game.canUndo) {
    event.preventDefault()
    game.undo()
  } else if (event.key === 'h' && inPlay.value) {
    event.preventDefault()
    game.showHint()
  }
}

// ---------------------------------------------------------------- shake

const shake = useShake(advance)

onMounted(() => {
  window.addEventListener('keydown', onWindowKeydown)
  if (!isMobile() || shake.needsPermission()) return
  toast.value = 'Shake it to roll the dice'
  setTimeout(() => (toast.value = ''), 2500)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onWindowKeydown)
  game.stopTimer()
})

const onAction = async () => {
  if (shake.needsPermission() && (await shake.requestPermission())) shake.start()
  advance()
}
</script>

<template>
  <div class="Game board-metrics" :style="{ '--rows': game.rows }">
    <p class="visually-hidden" role="status" aria-live="polite">{{ game.announcement }}</p>

    <div class="board-area">
      <div
        class="tile-position"
        role="grid"
        :aria-label="`${game.mode.label} board, ${game.rows} rows of 9 tiles`"
        :aria-rowcount="game.rows"
        @keydown="onGridKeydown"
      >
        <TileRow
          v-for="(row, index) in game.tiles"
          :key="index"
          :tiles="row"
          :row-index="index"
          :cursor="cursor"
          :play-click="playClick"
        />
      </div>
    </div>

    <div class="footer">
      <ul class="scoreline list-reset">
        <li class="side">
          <TweenedNumber v-if="game.rows > 2" title="Bonus" :value="game.gameBonus" />
        </li>
        <li class="dice-cell">
          <div id="dice" :class="{ blocked: !inPlay }">
            <DiceFace
              v-for="die in game.dice"
              :key="die.id"
              :value="die.number"
              :inactive="!die.isAvailable"
            />
          </div>
          <p v-if="game.mode.turnSeconds > 0 && inPlay" class="timer" :class="{ low: timerLow }">
            <span class="visually-hidden">Time left </span>{{ game.secondsLeft }}s
          </p>
        </li>
        <li class="side">
          <TweenedNumber v-if="game.rows > 2" title="Points" :value="game.gamePoints" />
        </li>
      </ul>

      <div v-if="inPlay" class="turn-tools">
        <button type="button" class="tool" :disabled="!game.canUndo" @click="game.undo()">
          <AppIcon name="undo" /> Undo <kbd>U</kbd>
        </button>
        <button type="button" class="tool" @click="game.showHint()">
          <AppIcon name="bulb" /> Hint <kbd>H</kbd>
        </button>
      </div>

      <label v-if="game.canRollSingleDie && game.state === 'isNext'" class="single-die">
        <input type="checkbox" :checked="game.singleDie" @change="game.toggleSingleDie()" />
        Roll one die
      </label>

      <Transition name="fade" mode="out-in">
        <button
          v-if="button && !game.isLoading"
          :key="game.state"
          type="button"
          class="action-button"
          :class="{ shake: game.state === 'isOver' }"
          @click="onAction"
        >
          <span class="action-icon"><AppIcon :name="button.icon" :spin="game.isLoading" /></span>
          <span class="action-label" :class="button.colour">{{ button.message }}</span>
        </button>
        <div v-else class="game">
          <SelectedTiles />
        </div>
      </Transition>
    </div>

    <Transition name="fade">
      <p v-if="toast" class="toast" role="status">{{ toast }}</p>
    </Transition>
  </div>
</template>

<style scoped>
.Game {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.board-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  padding: 0 0.5rem;
}
.tile-position {
  position: relative;
  z-index: 20;
}
.footer {
  flex: none;
  padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
}

.scoreline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin: 0 0 0.25rem;
  padding: 0 0.75rem;
}
.side {
  flex: 1;
  min-width: 0;
}
.dice-cell {
  flex: none;
}
#dice {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  transition: opacity 0.25s;
}
.blocked {
  opacity: 0.45;
}
.timer {
  margin: 0.15rem 0 0;
  color: #fff;
  font-size: 0.85rem;
  font-variant-numeric: tabular-nums;
}
.timer.low {
  color: #fff382;
  font-weight: 700;
}

.turn-tools {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 0.4rem;
}
.tool {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font: inherit;
  font-size: 0.78rem;
  color: #16351f;
  background: rgb(255 255 255 / 82%);
  border: 0;
  border-radius: 999px;
  padding: 0.3rem 0.7rem;
  cursor: pointer;
}
.tool:disabled {
  opacity: 0.42;
  cursor: not-allowed;
}
.tool kbd {
  font: inherit;
  font-size: 0.66rem;
  opacity: 0.6;
  border: 1px solid currentcolor;
  border-radius: 3px;
  padding: 0 0.22rem;
}

.single-die {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: #fff;
  font-size: 0.82rem;
  margin-bottom: 0.4rem;
  cursor: pointer;
}

.action-button {
  display: flex;
  max-width: 220px;
  margin: 0 auto 0.5rem;
  padding: 0;
  border: 0;
  border-bottom: 4px solid #22292f;
  border-radius: 0 0 0.3rem 0.3rem;
  background: #fff382;
  cursor: pointer;
  font: inherit;
  font-weight: 600;
  overflow: hidden;
}
.action-icon,
.action-label {
  display: block;
  padding: 0.55rem 0.7rem;
  color: #22292f;
}
.action-label {
  flex: 1;
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
.action-button:focus-visible,
.tool:focus-visible,
.single-die:focus-within {
  outline: 3px solid #16351f;
  outline-offset: 2px;
}

.toast {
  color: #fff;
  background: rgb(34 41 47 / 82%);
  border-radius: 6px;
  padding: 8px 12px;
  margin: 0 auto 8px;
  max-width: 260px;
  font-size: 14px;
}
</style>
