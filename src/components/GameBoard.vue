<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useGameStore } from '@/stores/game'
import { useMatchStore } from '@/stores/match'
import { useStatsStore } from '@/stores/stats'
import { useArcadeStore } from '@/stores/arcade'
import { SPECIALS } from '@/stores/modes'
import { isMobile } from '@/services/gameServices'
import { haptic, sound } from '@/services/sound'
import { useShake } from '@/composables/useShake'
import AppIcon from './AppIcon.vue'
import Confetti from './Confetti.vue'
import DiceFace from './DiceFace.vue'
import ShareScore from './ShareScore.vue'
import SelectedTiles from './SelectedTiles.vue'
import TileRow from './TileRow.vue'
import TweenedNumber from './TweenedNumber.vue'

/* The board asks the shell to show the leaderboard; it does not own the menu. */
const emit = defineEmits(['scores'])

const game = useGameStore()
const match = useMatchStore()
const stats = useStatsStore()
const arcade = useArcadeStore()
const toast = ref('')
const actionEl = ref(null)

const BUTTON = {
  isNext: { message: 'ROLL DICE', colour: 'action-accent', icon: 'dice' },
  isOver: { message: 'PLAY AGAIN', colour: 'action-bad', icon: 'refresh' },
  isStart: { message: 'START GAME', colour: 'action-accent', icon: 'dice' },
  isWin: { message: 'PLAY AGAIN', colour: 'action-accent', icon: 'check' }
}
const button = computed(() => {
  const base = BUTTON[game.state] ?? null
  if (!base || !match.active || !game.isFinished) return base
  return { ...base, message: match.stage === 'p1' ? 'PASS TO PLAYER 2' : 'REMATCH' }
})
const matchDone = computed(() => match.active && match.stage === 'done')
const matchVerdict = computed(() =>
  match.winner === 'draw' ? "It's a draw" : match.winner === 'p1' ? 'Player 1 wins' : 'Player 2 wins'
)

/* Player 1 is done: same mode, same board, fresh flags — hand it over. */
const passToSecond = () => {
  match.advance()
  game.newGame(match.modeKey, match.layout)
}
/* A rematch is a new match on a new board. */
const rematch = () => {
  game.newGame(match.modeKey)
  match.begin(match.modeKey, game.tiles)
}

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
  () =>
    !match.active &&
    game.isFinished &&
    game.sumTilesTaken > 0 &&
    game.sumTilesTaken >= stats.bestFor(game.modeKey)
)
const inPlay = computed(() => game.state === '')
/*
 * One-time coaching: the collapsing-column rule is the game's best idea and
 * nothing in the UI explains it. The tip sits in the tray for the whole game
 * (never mid-game, so the board's height stays put) until a run is claimed.
 */
const TIP_KEY = 'shutTheCube.runTipDone'
const runTipDone = (() => {
  try {
    return localStorage.getItem(TIP_KEY) === '1'
  } catch {
    return true
  }
})()
const showRunTip = ref(!runTipDone && game.mode.allowsRuns)
watch(
  () => game.celebration,
  (c) => {
    if (!c || !c.detail?.includes('in one move')) return
    try {
      localStorage.setItem(TIP_KEY, '1')
    } catch {
      // Fine to teach again next time.
    }
  }
)
/* The board stays mounted across rematches, so re-read the flag whenever a
   fresh game begins — the tip retires on the next game, never mid-board. */
watch(
  () => game.state,
  (state) => {
    if (state !== 'isStart') return
    try {
      showRunTip.value = localStorage.getItem(TIP_KEY) !== '1' && game.mode.allowsRuns
    } catch {
      showRunTip.value = false
    }
  }
)

/*
 * Post a finished daily to the leaderboard.
 *
 * Only a seeded solo game is ranked: an unseeded board cannot be rebuilt, so
 * its score cannot be checked, and an unverifiable entry on a public board is
 * worth less than no entry. Signed out, or offline, this does nothing at all —
 * the score is already safe in local storage either way.
 */
const rankable = computed(() => !match.active && game.isFinished && game.isDaily)

const submission = () => ({
  mode: game.modeKey,
  period: game.dayStamp,
  seed: game.seed,
  score: game.sumTilesTaken,
  rolls: game.numberPlay,
  won: game.state === 'isWin',
  moves: game.moves
})

watch(
  () => game.isFinished,
  (finished) => {
    if (!finished || !rankable.value) return
    arcade.postScore(submission())
  }
)

/* Signing in navigates away, so the finished game travels with it. */
const postAndSignIn = () => arcade.startSignIn(submission())

/* The tray never sits empty: between turns it says what it is for. */
const trayHint = computed(() =>
  game.state === 'isStart'
    ? 'Rolls, moves and calls show up here.'
    : game.state === 'isNext'
      ? 'Roll again — then pick tiles that match.'
      : ''
)
const shareResult = computed(() =>
  matchDone.value
    ? {
        match: true,
        modeLabel: game.mode.label,
        modeKey: game.modeKey,
        max: game.rows * 45,
        p1: match.results.p1,
        p2: match.results.p2,
        verdict: matchVerdict.value
      }
    : {
        modeLabel: game.mode.label,
        modeKey: game.modeKey,
        score: game.sumTilesTaken,
        max: game.rows * 45,
        rolls: game.numberPlay,
        won: game.state === 'isWin',
        // Carried so the card can name the day and the link can hand over the
        // very same board rather than merely the same mode.
        seed: game.seed,
        day: game.dayIndex,
        streak: stats.dayStreak()
      }
)
const timerLow = computed(() => game.mode.turnSeconds > 0 && game.secondsLeft <= 10)

/* Each tile answers with its own note; the board is the instrument. */
const playClick = (face) => {
  sound.tap(face)
  haptic(8)
}

const advance = () => {
  if (game.isLoading) return
  game.isLoading = true
  switch (game.state) {
    case 'isStart':
      sound.roll()
      haptic(15)
      game.startGame()
      break
    case 'isNext':
      sound.roll()
      haptic(15)
      game.nextTurn()
      break
    case 'isOver':
    case 'isWin':
      if (match.active && match.stage === 'p1') passToSecond()
      else if (match.active) rematch()
      else game.restart()
      break
  }
  game.isLoading = false
}

/* The end of a game and a called-out move each get their own voice. */
watch(
  () => game.state,
  (state) => {
    if (state === 'isWin') {
      sound.win()
      haptic([30, 60, 30, 60, 120])
    } else if (state === 'isOver') {
      sound.over()
      haptic(80)
    }
  }
)
watch(
  () => game.celebration,
  (c) => {
    if (c) sound.run(3)
  }
)

/* Ninja's countdown becomes audible for its last five seconds. */
watch(
  () => game.secondsLeft,
  (left) => {
    if (game.mode.turnSeconds > 0 && inPlay.value && left > 0 && left <= 5) sound.tick()
  }
)

const doUndo = () => {
  if (!game.canUndo) return
  game.undo()
  sound.undo()
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
    doUndo()
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
      <Confetti v-if="game.state === 'isWin'" />

      <!-- Pass & play: whose game this is, said with the die itself — one pip
           for Player 1, two for Player 2. Sits above the start overlay too, so
           the person just handed the device knows before they touch anything. -->
      <Transition name="pop">
        <div
          v-if="match.active && match.stage !== 'done'"
          :key="match.stage"
          class="player-flag"
          role="status"
        >
          <svg class="flag-die" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="1.5" y="1.5" width="21" height="21" rx="5.5" class="flag-body" />
            <template v-if="match.stage === 'p1'">
              <circle cx="12" cy="12" r="2.6" class="flag-pip" />
            </template>
            <template v-else>
              <circle cx="8" cy="8" r="2.6" class="flag-pip" />
              <circle cx="16" cy="16" r="2.6" class="flag-pip" />
            </template>
          </svg>
          <span v-if="match.stage === 'p1'">Player 1</span>
          <span v-else>Player 2 · beat <b class="num">{{ match.target }}</b></span>
        </div>
      </Transition>
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
          <div v-if="game.isFinished" class="result panel-glass" :class="game.state">
            <p class="result-eyebrow micro">
              <template v-if="matchDone">Pass &amp; play — final</template>
              <template v-else-if="match.active">Pass &amp; play — Player 1</template>
              <template v-else>{{ game.state === 'isWin' ? 'You did it' : game.note }}</template>
            </p>
            <h2 class="result-title display">
              {{ matchDone ? matchVerdict : game.state === 'isWin' ? 'BOX SHUT!' : 'Game over' }}
            </h2>
            <p v-if="matchDone" class="match-scores">
              <span :class="{ winner: match.winner === 'p1' }">
                P1 <strong class="num">{{ match.results.p1.score }}</strong>
              </span>
              <span :class="{ winner: match.winner === 'p2' }">
                P2 <strong class="num">{{ match.results.p2.score }}</strong>
              </span>
            </p>
            <p v-else class="result-score">
              <strong class="num">{{ game.sumTilesTaken }}</strong>
              <span>of {{ game.rows * 45 }} points</span>
            </p>
            <p v-if="match.active && match.stage === 'p1'" class="handoff">
              Player 1 banked <b class="num">{{ game.sumTilesTaken }}</b> — hand the device over.
            </p>
            <p v-if="isPersonalBest" class="pb">
              <AppIcon name="trophy" /> New personal best
            </p>
            <p v-else-if="game.state === 'isWin'" class="pb subtle">
              Every tile shut in {{ game.numberPlay }} rolls
            </p>
            <!-- Where today's game landed against everyone else's, or the
                 offer to put it there. Only ever for a ranked daily. -->
            <p v-if="arcade.lastRank" class="rank-line micro">
              <b class="num">#{{ arcade.lastRank }}</b> on today’s {{ game.mode.label }} board
              &middot;
              <button type="button" class="rank-link" @click="emit('scores')">See the board</button>
            </p>
            <button
              v-else-if="rankable && !arcade.signedIn"
              type="button"
              class="post-cta"
              @click="postAndSignIn"
            >
              Put this score on the daily board
              <small>Sign in with Google · your name only, no email</small>
            </button>

            <button type="button" class="again display" @click="onAction">
              {{ button.message }} <kbd>Space</kbd>
            </button>
            <ShareScore v-if="!match.active || matchDone" :result="shareResult" />
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
            <span class="action-label display">{{ button.message }}</span>
            <span class="action-hint on-keys">or press <kbd>Space</kbd></span>
          </button>
        </div>
      </Transition>

      <!-- Runs, wilds and between-turn events announce themselves here. -->
      <Transition name="pop">
        <div v-if="game.celebration" :key="game.celebration.id" class="celebration">
          <strong class="display">{{ game.celebration.title }}</strong>
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
          <!-- Rendered whenever the mode is timed, and only *shown* during a
               turn: the board sizes itself from the space the footer leaves,
               so a timer that mounted and unmounted made every tile resize. -->
          <p
            v-if="game.mode.turnSeconds > 0"
            class="timer num"
            :class="{ low: timerLow && inPlay, waiting: !inPlay }"
          >
            <span class="visually-hidden">Time left </span>{{ game.secondsLeft }}s
          </p>
        </div>

        <div class="slot">
          <TweenedNumber class="readout-points" title="Points" :value="game.gamePoints" />
        </div>
      </div>

      <div class="turn-tools" :class="{ hidden: !inPlay }">
        <button type="button" class="tool" :disabled="!game.canUndo" @click="doUndo">
          <AppIcon name="undo" /> Undo <kbd>U</kbd>
        </button>
        <button type="button" class="tool" :disabled="!inPlay" @click="game.showHint()">
          <AppIcon name="bulb" /> Hint <kbd>H</kbd>
        </button>
      </div>

      <!-- The call tray: everything the game says lands here, and the panel
           is visible even before it speaks so the space reads as reserved on
           purpose rather than left over. -->
      <div class="tray">
        <ul v-if="legend.length" class="legend">
          <li v-for="item in legend" :key="item.key">
            <span class="legend-mark" aria-hidden="true">{{ item.mark }}</span>
            <b>{{ item.name }}</b>
            {{ item.hint }}
          </li>
        </ul>

        <!-- Once on, this stays for the rest of the game — one layout change,
             not a per-turn one, so it may sit outside the reserved caption. -->
        <p v-if="showRunTip" class="run-tip">
          Tiles wearing a <span class="tip-badge" aria-hidden="true">2</span> badge take the whole
          column in one move<span class="pointer-fine"> — hover one to preview the run</span>.
        </p>

        <p v-if="game.mustRollSingleDie" class="single-note">
          One die — only {{ game.openTotal }} left on the board
        </p>

        <div class="caption">
          <template v-if="inPlay">
            <SelectedTiles />
            <p v-if="game.waysToMatch.length > 1" class="ways">
              {{ game.waysToMatch.length }} ways to make {{ game.remainingToMatch }} —
              <span class="on-keys"><kbd>H</kbd> cycles them</span>
              <span class="on-touch">Hint cycles them</span>
            </p>
          </template>
          <label
            v-else-if="game.canRollSingleDie && game.state === 'isNext'"
            class="single-die"
          >
            <input type="checkbox" :checked="game.singleDie" @change="game.toggleSingleDie()" />
            Roll one die
          </label>
          <p v-else-if="trayHint" class="tray-idle">{{ trayHint }}</p>
        </div>
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

.player-flag {
  position: absolute;
  top: 0.45rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 6;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  background: rgb(9 29 22 / 85%);
  border: 1px solid var(--line);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--bone);
  white-space: nowrap;
  pointer-events: none;
}
.player-flag b {
  color: var(--sel);
  font-size: 0.85rem;
}
.flag-die {
  width: 19px;
  height: 19px;
  flex: none;
}
.flag-body {
  fill: var(--bone);
  stroke: #10291d;
  stroke-width: 1.6;
}
.flag-pip {
  fill: #10291d;
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
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
}
.action-button {
  display: grid;
  justify-items: center;
  gap: 0.15rem;
  padding: 1.15rem 2.4rem 1rem;
  border: 0;
  border-bottom: 6px solid rgb(0 0 0 / 35%);
  border-radius: 22px;
  cursor: pointer;
  font: inherit;
  color: #10291d;
  box-shadow: 0 10px 28px rgb(0 0 0 / 45%);
  transition: transform 0.09s, filter 0.09s, box-shadow 0.09s;
  animation:
    action-in 0.34s cubic-bezier(0.2, 1.3, 0.4, 1),
    action-breathe 2.6s ease-in-out 0.4s infinite;
}
.action-accent {
  background: var(--accent);
}
.action-bad {
  background: var(--bad);
}
/* It is a tile, so it behaves like one: rises to the hover, presses to the click. */
.action-button:hover {
  transform: translateY(-2px);
  filter: brightness(1.06);
  box-shadow:
    0 12px 30px rgb(0 0 0 / 45%),
    0 0 40px color-mix(in srgb, var(--accent) 35%, transparent);
}
@keyframes action-in {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.92);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
@keyframes action-breathe {
  0%,
  100% {
    box-shadow:
      0 10px 28px rgb(0 0 0 / 45%),
      0 0 0 color-mix(in srgb, var(--accent) 0%, transparent);
  }
  50% {
    box-shadow:
      0 10px 28px rgb(0 0 0 / 45%),
      0 0 34px color-mix(in srgb, var(--accent) 30%, transparent);
  }
}
.action-icon {
  font-size: 1.5rem;
}
.action-label {
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: 0.06em;
}
.action-hint {
  font-size: 0.7rem;
  opacity: 0.72;
}
.action-hint kbd {
  color: inherit;
  border-color: currentcolor;
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
  max-width: 22rem;
  animation: result-in 0.32s cubic-bezier(0.2, 1.3, 0.4, 1);
}
@keyframes result-in {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.94);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
.result-eyebrow {
  margin: 0;
}
.result-title {
  margin: 0;
  font-size: clamp(1.9rem, 8vmin, 3rem);
  font-weight: 700;
  letter-spacing: 0.01em;
  line-height: 1.1;
  color: var(--bone);
}
.isWin .result-title {
  color: var(--bonus);
  text-shadow: 0 0 26px color-mix(in srgb, var(--bonus) 45%, transparent);
}
.isOver .result-title {
  color: var(--bad);
}
.match-scores {
  margin: 0.45rem 0 0;
  display: flex;
  gap: 1.4rem;
  color: var(--muted);
  font-size: 0.85rem;
}
.match-scores strong {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--bone);
  margin-left: 0.3rem;
}
.match-scores .winner,
.match-scores .winner strong {
  color: var(--bonus);
}
.handoff {
  margin: 0.35rem 0 0;
  font-size: 0.82rem;
  color: var(--bone);
}
.handoff b {
  color: var(--sel);
}
.result-score {
  margin: 0.35rem 0 0;
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
  color: var(--bone);
}
.result-score strong {
  font-size: 2rem;
  font-weight: 700;
  color: var(--sel);
}
.result-score span {
  font-size: 0.8rem;
  color: var(--muted);
}
.pb {
  animation: pb-pop 0.5s cubic-bezier(0.2, 1.5, 0.4, 1) 0.25s backwards;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin: 0.4rem 0 0;
  background: var(--sel);
  color: #22292f;
  font-weight: 700;
  font-size: 0.75rem;
  border-radius: 999px;
  padding: 0.2rem 0.7rem;
}
@keyframes pb-pop {
  from {
    opacity: 0;
    transform: scale(0.6);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.pb.subtle {
  background: none;
  color: var(--muted);
  font-weight: 500;
  padding: 0;
}
.rank-link {
  background: none;
  border: 0;
  padding: 0;
  color: var(--muted);
  font: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
}
.rank-link:hover {
  color: var(--bone);
}

/* The offer to post is the one action on a finished daily that is not "again",
   so it reads as an invitation rather than a second primary button. */
.post-cta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
  margin: 0 0 10px;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--accent) 55%, transparent);
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  color: var(--bone);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
.post-cta small {
  font-weight: 400;
  font-size: 0.72rem;
  color: var(--muted);
}
.post-cta:hover {
  background: color-mix(in srgb, var(--accent) 22%, transparent);
}

.rank-line {
  margin: 0 0 4px;
  color: var(--muted);
}
.rank-line b {
  color: var(--accent);
  font-size: 1.05em;
}

.again {
  margin-top: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.06em;
  color: #10291d;
  background: var(--accent);
  border: 0;
  border-bottom: 4px solid rgb(0 0 0 / 35%);
  border-radius: 14px;
  padding: 0.7rem 1.4rem 0.6rem;
  cursor: pointer;
  transition: transform 0.09s, filter 0.09s, box-shadow 0.09s;
}
.isOver .again {
  background: var(--bad);
}
.again kbd {
  font-size: 0.7rem;
  opacity: 0.75;
  color: inherit;
  border-color: currentcolor;
}
.again:hover {
  transform: translateY(-2px);
  filter: brightness(1.06);
  box-shadow: 0 6px 24px color-mix(in srgb, var(--accent) 30%, transparent);
}
.again:active {
  transform: translateY(1px);
  border-bottom-width: 2px;
}

/* Called-out moments: a run claimed, a wild played, an event fired. */
/*
 * This lands on top of the board, so it can be over a pale tile as easily as
 * over the ground. Shadowed text alone could not hold both, so it sits on the
 * same dark plate as the tray below and is legible wherever it falls.
 */
.celebration {
  position: absolute;
  left: 50%;
  bottom: 12%;
  translate: -50% 0;
  z-index: 6;
  display: grid;
  justify-items: center;
  gap: 0.1rem;
  max-width: min(22rem, calc(100% - 2rem));
  padding: 0.5rem 1.15rem 0.6rem;
  background: rgb(9 29 22 / 92%);
  border: 1px solid var(--line);
  border-radius: 16px;
  box-shadow: 0 12px 32px rgb(0 0 0 / 45%);
  text-align: center;
  pointer-events: none;
}
.celebration strong {
  font-size: clamp(1.4rem, 6.5vmin, 2.2rem);
  font-weight: 700;
  letter-spacing: 0.01em;
  line-height: 1.1;
  color: var(--sel);
}
.celebration span {
  font-size: 0.8rem;
  color: var(--muted);
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

.tray {
  width: min(calc(100% - 1.5rem), 36rem);
  margin: 0.35rem auto 0;
  padding: 0.55rem 0.9rem 0.5rem;
  background: rgb(9 29 22 / 55%);
  border: 1px solid var(--line);
  border-radius: 16px;
}
.tray-idle {
  margin: 0;
  font-size: 0.8rem;
  color: var(--muted);
}
.run-tip {
  margin: 0 0 0.4rem;
  font-size: 0.78rem;
  color: var(--bonus);
}
.tip-badge {
  display: inline-grid;
  place-items: center;
  width: 15px;
  height: 15px;
  font-size: 10px;
  font-weight: 700;
  color: #10291d;
  background: var(--bonus);
  border: 1px solid #10291d;
  border-radius: 999px;
  vertical-align: -2px;
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
  color: var(--muted);
}
.legend li {
  display: inline-flex;
  align-items: baseline;
  gap: 0.3rem;
}
.legend b {
  color: var(--bone);
  font-weight: 600;
}
.legend-mark {
  font-size: 0.85rem;
  color: var(--bone);
}

.ways {
  margin: 0.25rem 0 0;
  font-size: 0.78rem;
  color: var(--muted);
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
  --readout: var(--bonus);
}
.readout-points {
  --readout: var(--sel);
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
  border-radius: 0.8rem;
  cursor: pointer;
}
.dice-button:not(:disabled):hover {
  background: rgb(255 255 255 / 10%);
  transform: translateY(-2px);
}
.dice-button {
  transition: transform 0.12s, background 0.12s;
}
/* The dice are the turn's key information, so they never dim — only the
   affordance to click them goes away once the roll has happened. */
.dice-button:disabled {
  cursor: default;
}
.timer {
  margin: 0.15rem 0 0;
  color: var(--bone);
  font-size: 0.85rem;
}
.timer.waiting {
  visibility: hidden;
}
.timer.low {
  color: var(--bad);
  font-weight: 700;
  animation: timer-tick 1s ease-in-out infinite;
}
@keyframes timer-tick {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.12);
  }
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
  color: var(--bone);
  background: rgb(255 255 255 / 12%);
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 0.3rem 0.7rem;
  cursor: pointer;
  transition: border-color 0.1s;
}
.tool:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--accent) 75%, transparent);
}
.tool:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.tool kbd {
  font-size: 0.66rem;
  opacity: 0.75;
}

.single-note {
  margin: 0;
  color: var(--bonus);
  font-size: 0.78rem;
}
.single-die {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--bone);
  font-size: 0.82rem;
  cursor: pointer;
}

/* Reserved to fit its tallest tenant — a selected-tiles row, its sum line
   AND the ways line together — so the board above never resizes as the tray
   speaks. Measured against the real render — the <kbd> cap in the ways
   line grows its line box past the type size. */
.caption {
  min-height: 5.3rem;
  display: grid;
  place-items: center;
  padding: 0 0.5rem;
}

.action-button:focus-visible,
.dice-button:focus-visible,
.tool:focus-visible,
.single-die:focus-within {
  outline: 3px solid var(--accent);
  outline-offset: 3px;
}

.toast {
  color: var(--bone);
  background: rgb(9 29 22 / 88%);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 8px 12px;
  margin: 0 auto 8px;
  max-width: 260px;
  font-size: 14px;
}

@media (hover: none) and (pointer: coarse) {
  .tool kbd,
  .action-hint,
  .again kbd {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .action-button,
  .again,
  .turn-tools {
    transition: none;
  }
  .action-button:hover,
  .again:hover {
    transform: none;
  }
  .pop-enter-active,
  .pop-leave-active {
    animation: none;
    transition: none;
  }
  .result,
  .pb,
  .action-button,
  .timer.low {
    animation: none;
  }
  .action-button:hover,
  .again:hover,
  .dice-button:not(:disabled):hover {
    transform: none;
  }
}
</style>
