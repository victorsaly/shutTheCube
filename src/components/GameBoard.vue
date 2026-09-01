<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useGameStore } from '@/stores/game'
import { useStatsStore } from '@/stores/stats'
import { SPECIALS } from '@/stores/modes'
import { isMobile } from '@/services/gameServices'
import { useShake } from '@/composables/useShake'
import AppIcon from './AppIcon.vue'
import DiceFace from './DiceFace.vue'
import SelectedTiles from './SelectedTiles.vue'
import TileRow from './TileRow.vue'
import TweenedNumber from './TweenedNumber.vue'

const game = useGameStore()
const stats = useStatsStore()
const toast = ref('')
const actionEl = ref(null)

const BUTTON = {
  isNext: { message: 'ROLL DICE', colour: 'action-green', icon: 'dice' },
  isOver: { message: 'PLAY AGAIN', colour: 'action-red', icon: 'refresh' },
  isStart: { message: 'START GAME', colour: 'action-green', icon: 'dice' },
  isWin: { message: 'PLAY AGAIN', colour: 'action-green', icon: 'check' }
}
const button = computed(() => BUTTON[game.state] ?? null)

/**
 * Only the special tiles actually on this board, so the legend explains what is
 * in front of the player and nothing else. Their meanings previously lived only
 * in each tile's accessible name, which sighted players never see.
 */
const legend = computed(() => {
  const present = new Set(
    game.tiles.flat().filter((t) => !t.isTaken && t.kind !== 'normal').map((t) => t.kind)
  )
  return [...present].map((kind) => SPECIALS[kind]).filter(Boolean)
})
const isPersonalBest = computed(
  () => game.isFinished && game.sumTilesTaken > 0 && game.sumTilesTaken >= stats.bestFor(game.modeKey)
)
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

  // Space rolls, wherever the player is on the page. It is only claimed while
  // the board is waiting, so during a turn Space still activates the focused
  // tile the way a button normally would. A focused button is left to handle
  // its own key so the action does not fire twice.
  if ((event.key === ' ' || event.key === 'Enter') && !inPlay.value) {
    if (document.activeElement?.tagName === 'BUTTON') return
    event.preventDefault()
    onAction()
    return
  }
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
  <div class="Game">
    <p class="visually-hidden" role="status" aria-live="polite">{{ game.announcement }}</p>

    <div class="board-area">
      <div
        class="tile-position board-metrics"
        :class="{ 'single-row': game.rows === 1 }"
        :style="{ '--rows': game.rows }"
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

      <!--
        The action sits over the middle of the board rather than below the
        dice, so the roll is where the eye already is and never needs a reach
        to the bottom of the screen. Space and Enter do the same thing.
      -->
      <Transition name="fade">
        <div v-if="button && !game.isLoading" class="action-layer">
          <!-- Shutting the box is the whole point of the game, so the result
               leads and the button that starts the next one follows it. -->
          <div v-if="game.isFinished" class="result" :class="game.state">
            <p class="result-eyebrow">
              {{ game.state === 'isWin' ? 'You did it' : game.note }}
            </p>
            <h2 class="result-title">
              {{ game.state === 'isWin' ? 'BOX SHUT!' : 'Game over' }}
            </h2>
            <p class="result-score">
              <strong>{{ game.sumTilesTaken }}</strong>
              <span>of {{ game.rows * 45 }} points</span>
            </p>
            <p v-if="isPersonalBest" class="pb">
              <AppIcon name="trophy" /> New personal best
            </p>
            <p v-else-if="game.state === 'isWin'" class="pb subtle">
              Every tile shut in {{ game.numberPlay }} rolls
            </p>
            <button type="button" class="again" @click="onAction">
              {{ button.message }} <kbd>Space</kbd>
            </button>
          </div>

          <button
            v-else
            ref="actionEl"
            type="button"
            class="action-button"
            :class="button.colour"
            @click="onAction"
          >
            <AppIcon :name="button.icon" class="action-icon" />
            <span class="action-label">{{ button.message }}</span>
            <span class="action-hint">or press <kbd>Space</kbd></span>
          </button>
        </div>
      </Transition>

      <!-- Runs, wilds and between-turn events announce themselves here. -->
      <Transition name="pop">
        <div v-if="game.celebration" :key="game.celebration.id" class="celebration">
          <strong>{{ game.celebration.title }}</strong>
          <span>{{ game.celebration.detail }}</span>
        </div>
      </Transition>
    </div>

    <div class="footer">
      <div class="scoreline">
        <div class="slot">
          <TweenedNumber
            v-if="game.mode.allowsRuns"
            class="readout-bonus"
            title="Bonus"
            :value="game.gameBonus"
          />
          <TweenedNumber
            v-else
            class="readout-bonus"
            title="Best"
            :value="stats.bestFor(game.modeKey)"
          />
        </div>

        <div class="dice-cell">
          <button
            type="button"
            class="dice-button"
            :disabled="inPlay"
            :aria-label="inPlay ? 'Dice' : 'Roll the dice'"
            @click="onAction"
          >
            <DiceFace v-for="die in game.activeDice" :key="die.id" :value="die.number" />
          </button>
          <p v-if="game.mode.turnSeconds > 0 && inPlay" class="timer" :class="{ low: timerLow }">
            <span class="visually-hidden">Time left </span>{{ game.secondsLeft }}s
          </p>
        </div>

        <div class="slot">
          <TweenedNumber class="readout-points" title="Points" :value="game.gamePoints" />
        </div>
      </div>

      <div class="turn-tools" :class="{ hidden: !inPlay }">
        <button type="button" class="tool" :disabled="!game.canUndo" @click="game.undo()">
          <AppIcon name="undo" /> Undo <kbd>U</kbd>
        </button>
        <button type="button" class="tool" :disabled="!inPlay" @click="game.showHint()">
          <AppIcon name="bulb" /> Hint <kbd>H</kbd>
        </button>
      </div>

      <p v-if="game.mustRollSingleDie" class="single-note">
        One die — only {{ game.openTotal }} left on the board
      </p>
      <label
        v-else-if="game.canRollSingleDie && game.state === 'isNext'"
        class="single-die"
      >
        <input type="checkbox" :checked="game.singleDie" @change="game.toggleSingleDie()" />
        Roll one die
      </label>

      <ul v-if="legend.length" class="legend">
        <li v-for="item in legend" :key="item.key">
          <span class="legend-mark" aria-hidden="true">{{ item.mark }}</span>
          {{ item.label }}
        </li>
      </ul>

      <div class="caption">
        <SelectedTiles v-if="inPlay" />
        <p v-if="inPlay && game.waysToMatch.length > 1" class="ways">
          {{ game.waysToMatch.length }} ways to make {{ game.remainingToMatch }} —
          <kbd>H</kbd> cycles them
        </p>
      </div>
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

/* The board and the action share one centred stacking context. This is also
   the query container the tiles size themselves against. */
.board-area {
  position: relative;
  flex: 1;
  display: grid;
  place-items: center;
  min-height: 0;
  padding: 0 0.5rem;
  container-type: size;
}
.tile-position {
  position: relative;
  z-index: 1;
}

.action-layer {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: grid;
  place-content: center;
  gap: 0.75rem;
  background: radial-gradient(
    ellipse at center,
    rgb(9 29 22 / 88%) 0%,
    rgb(9 29 22 / 72%) 45%,
    rgb(9 29 22 / 45%) 100%
  );
  backdrop-filter: blur(2px);
}
.action-button {
  display: grid;
  justify-items: center;
  gap: 0.15rem;
  padding: 1rem 2rem;
  border: 0;
  border-bottom: 5px solid rgb(0 0 0 / 45%);
  border-radius: 0.7rem;
  cursor: pointer;
  font: inherit;
  color: #10291d;
  box-shadow: 0 8px 24px rgb(0 0 0 / 45%);
}
.action-green {
  background: #51d88a;
}
.action-red {
  background: #ff8f6b;
}
.action-icon {
  font-size: 1.5rem;
}
.action-label {
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}
.action-hint {
  font-size: 0.7rem;
  opacity: 0.72;
}
.action-hint kbd {
  font: inherit;
  border: 1px solid currentcolor;
  border-radius: 3px;
  padding: 0 0.25rem;
}
.action-button:active {
  transform: translateY(2px);
  border-bottom-width: 2px;
}
.result {
  display: grid;
  justify-items: center;
  gap: 0.3rem;
  padding: 1.5rem 1.75rem 1.25rem;
  border-radius: 1rem;
  background: rgb(20 64 46 / 92%);
  border: 1px solid rgb(127 240 174 / 25%);
  box-shadow: 0 20px 50px rgb(0 0 0 / 55%);
  max-width: 22rem;
}
.result-eyebrow {
  margin: 0;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--ink-dim);
}
.result-title {
  margin: 0;
  font-size: clamp(1.9rem, 8vmin, 3rem);
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 1;
  color: var(--ink);
}
.isWin .result-title {
  color: var(--accent-bonus);
  text-shadow: 0 0 26px rgb(127 240 174 / 45%);
}
.isOver .result-title {
  color: #ff8f6b;
}
.result-score {
  margin: 0.35rem 0 0;
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
  color: var(--ink);
}
.result-score strong {
  font-size: 2rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: var(--accent);
}
.result-score span {
  font-size: 0.8rem;
  color: var(--ink-dim);
}
.pb {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin: 0.4rem 0 0;
  background: var(--accent);
  color: #22292f;
  font-weight: 700;
  font-size: 0.75rem;
  border-radius: 999px;
  padding: 0.2rem 0.7rem;
}
.pb.subtle {
  background: none;
  color: var(--ink-dim);
  font-weight: 500;
  padding: 0;
}
.again {
  margin-top: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font: inherit;
  font-weight: 700;
  font-size: 0.9rem;
  color: #10291d;
  background: var(--accent-bonus);
  border: 0;
  border-bottom: 4px solid rgb(0 0 0 / 35%);
  border-radius: 0.5rem;
  padding: 0.6rem 1.2rem;
  cursor: pointer;
}
.again kbd {
  font: inherit;
  font-size: 0.7rem;
  opacity: 0.7;
  border: 1px solid currentcolor;
  border-radius: 3px;
  padding: 0 0.25rem;
}
.again:active {
  transform: translateY(1px);
}

/* Called-out moments: a run claimed, a wild played, an event fired. */
.celebration {
  position: absolute;
  inset: auto 0 12%;
  z-index: 6;
  display: grid;
  justify-items: center;
  gap: 0.1rem;
  pointer-events: none;
}
.celebration strong {
  font-size: clamp(1.5rem, 7vmin, 2.4rem);
  font-weight: 900;
  letter-spacing: -0.02em;
  color: var(--accent);
  text-shadow: 0 3px 18px rgb(0 0 0 / 70%);
}
.celebration span {
  font-size: 0.8rem;
  color: var(--ink);
  text-shadow: 0 2px 8px rgb(0 0 0 / 80%);
}
.pop-enter-active {
  animation: pop-in 0.35s cubic-bezier(0.2, 1.5, 0.4, 1);
}
.pop-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.pop-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
@keyframes pop-in {
  0% {
    opacity: 0;
    transform: scale(0.7);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.legend {
  list-style: none;
  margin: 0 0 0.35rem;
  padding: 0 0.75rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem 0.9rem;
  justify-content: center;
  font-size: 0.78rem;
  color: #c2d4c9;
}
.legend li {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}
.legend-mark {
  font-size: 0.85rem;
  color: var(--ink);
}

.ways {
  margin: 0.25rem 0 0;
  font-size: 0.78rem;
  color: #c2d4c9;
}
.ways kbd {
  font: inherit;
  border: 1px solid currentcolor;
  border-radius: 3px;
  padding: 0 0.2rem;
}

.footer {
  flex: none;
  padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
}

/*
 * Equal side columns keep the dice on the exact centre line of the board,
 * whichever readouts a mode happens to show.
 */
.scoreline {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.75rem;
}
.slot {
  min-width: 0;
  display: flex;
  justify-content: center;
}
.readout-bonus {
  --readout: var(--accent-bonus);
}
.readout-points {
  --readout: var(--accent);
}
.dice-cell {
  display: grid;
  justify-items: center;
}
.dice-button {
  display: flex;
  gap: 0.6rem;
  padding: 0.3rem;
  background: none;
  border: 0;
  border-radius: 0.6rem;
  cursor: pointer;
}
.dice-button:not(:disabled):hover {
  background: rgb(255 255 255 / 10%);
}
/* The dice are the turn's key information, so they never dim — only the
   affordance to click them goes away once the roll has happened. */
.dice-button:disabled {
  cursor: default;
}
.timer {
  margin: 0.15rem 0 0;
  color: var(--ink);
  font-size: 0.85rem;
  font-variant-numeric: tabular-nums;
}
.timer.low {
  color: var(--accent);
  font-weight: 700;
}

.turn-tools {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin: 0.3rem 0;
  transition: opacity 0.2s;
}
/* Kept in the layout when idle so the footer never jumps height. */
.turn-tools.hidden {
  opacity: 0;
  pointer-events: none;
}
.tool {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font: inherit;
  font-size: 0.78rem;
  color: var(--ink);
  background: rgb(255 255 255 / 12%);
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: 999px;
  padding: 0.3rem 0.7rem;
  cursor: pointer;
}
.tool:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.tool kbd {
  font: inherit;
  font-size: 0.66rem;
  opacity: 0.7;
  border: 1px solid currentcolor;
  border-radius: 3px;
  padding: 0 0.22rem;
}

.single-note {
  margin: 0 0 0.3rem;
  color: var(--accent-bonus);
  font-size: 0.78rem;
}
.single-die {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--ink);
  font-size: 0.82rem;
  margin-bottom: 0.3rem;
  cursor: pointer;
}

/* Reserved so the board does not shift as the prompt text changes. */
.caption {
  min-height: 4.2rem;
  display: grid;
  place-items: center;
  padding: 0 0.75rem;
}

.action-button:focus-visible,
.dice-button:focus-visible,
.tool:focus-visible,
.single-die:focus-within {
  outline: 3px solid var(--accent);
  outline-offset: 3px;
}

.toast {
  color: var(--ink);
  background: rgb(9 29 22 / 88%);
  border-radius: 6px;
  padding: 8px 12px;
  margin: 0 auto 8px;
  max-width: 260px;
  font-size: 14px;
}

@media (prefers-reduced-motion: reduce) {
  .action-button,
  .turn-tools {
    transition: none;
  }
  .pop-enter-active,
  .pop-leave-active {
    animation: none;
    transition: none;
  }
}
</style>
