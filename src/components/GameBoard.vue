<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useGameStore } from '@/stores/game'
import { useMatchStore } from '@/stores/match'
import { useStatsStore } from '@/stores/stats'
import { useArcadeStore } from '@/stores/arcade'
import { SPECIALS } from '@/stores/modes'
import { isMobile } from '@/services/gameServices'
import { appleSignIn } from '@/services/native'
import { sound } from '@/services/sound'
import { buzz } from '@/services/haptics'
import { reminderAvailable, reminderOn, syncReminder } from '@/services/reminder'
import { useShake } from '@/composables/useShake'
import AppIcon from './AppIcon.vue'
import Confetti from './Confetti.vue'
import DiceFace from './DiceFace.vue'
import ReminderSwitch from './ReminderSwitch.vue'
import ShareScore from './ShareScore.vue'
import TileRow from './TileRow.vue'

/* The board asks the shell to show the leaderboard; it does not own the menu. */
const emit = defineEmits(['scores'])

const game = useGameStore()
const match = useMatchStore()
const stats = useStatsStore()
const arcade = useArcadeStore()
const toast = ref('')
const actionEl = ref(null)

const BUTTON = {
  isNext: 'Roll the dice',
  isStart: 'Roll to start',
  isOver: 'Play again',
  isWin: 'Play again'
}
/* What the one primary button says right now, or null during a turn. */
const button = computed(() => {
  const message = BUTTON[game.state] ?? null
  if (!message) return null
  if (!match.active || !game.isFinished) return { message }
  return { message: match.stage === 'p1' ? "I'm Player 2. Start" : 'Rematch' }
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
/*
 * A finished solo game that was not the daily. It cannot be ranked — an
 * unseeded board cannot be rebuilt, so its score cannot be checked — but
 * saying nothing at all reads as the leaderboard being broken.
 */
const unranked = computed(() => !match.active && game.isFinished && !game.isDaily)

const submission = () => ({
  mode: game.modeKey,
  period: game.dayStamp,
  seed: game.seed,
  score: game.sumTilesTaken,
  rolls: game.numberPlay,
  won: game.state === 'isWin',
  turns: game.turns
})

watch(
  () => game.isFinished,
  (finished) => {
    // Today's board is done, so today's reminder has nothing left to say.
    if (finished && game.isDaily) syncReminder({ playedToday: true })
    if (!finished || !rankable.value) return
    arcade.postScore(submission())
  }
)

/* Signing in navigates away, so the finished game travels with it. */
const postAndSignIn = () =>
  appleSignIn ? arcade.startAppleSignIn(submission()) : arcade.startSignIn(submission())

/* Whether the reminder was off when this result appeared; it stays on screen
   once offered, so turning it on does not make the switch vanish. */
const offerReminder = ref(!reminderOn.value)

/* Player 1 has finished and Player 2 has not started: the hand-over. */
const isHandover = computed(() => match.active && match.stage === 'p1' && game.isFinished)

// ------------------------------------------------------------ the result

const openTiles = computed(() => game.tiles.flat().filter((t) => !t.isTaken))
const COUNT_WORDS = { 1: 'One tile', 2: 'Two tiles', 3: 'Three tiles' }

const endTitle = computed(() => {
  if (matchDone.value) return matchVerdict.value
  if (game.state === 'isWin') return 'Box shut.'
  const left = COUNT_WORDS[openTiles.value.length]
  return left ? `${left} from shut.` : 'Game over'
})

const rollsLabel = computed(() => `${game.numberPlay} ${game.numberPlay === 1 ? 'roll' : 'rolls'}`)

const listOf = (values) =>
  values.length > 1 ? `${values.slice(0, -1).join(', ')} and ${values.at(-1)}` : `${values[0]}`

/* Why the game ended, in one sentence, from the dice and tiles still showing. */
const endReason = computed(() => {
  if (game.state === 'isWin') return `Every tile shut in ${rollsLabel.value}.`
  if (game.note === 'Out of time') return 'The clock ran out.'
  const rolled = game.diceSum
  const faces = openTiles.value.map((t) => t.index).sort((a, b) => b - a)
  const total = faces.reduce((a, b) => a + b, 0)
  if (faces.length === 1 && total < rolled) return `You rolled ${rolled}. Only the ${faces[0]} was left.`
  if (faces.length > 1 && faces.length <= 4) {
    return total < rolled
      ? `You rolled ${rolled}. The ${listOf(faces)} that were left only make ${total}.`
      : `You rolled ${rolled}. The ${listOf(faces)} that were left cannot make it.`
  }
  return `You rolled ${rolled}, and no open tiles add up to it.`
})

const resultLabel = computed(() => {
  if (match.active) return `Pass & play · ${game.mode.label}`
  return game.isDaily ? `Daily #${game.dayIndex} · ${game.mode.label}` : `Free play · ${game.mode.label}`
})

/* The final board as blocks: the same picture the shared card draws in text. */
const blocks = computed(() => game.tiles.flat().map((t) => ({ id: t.id, shut: t.isTaken })))
const shutCount = computed(() => blocks.value.filter((b) => b.shut).length)

// --------------------------------------------------------------- the sum

/* Bonus tiles a run pulled in do not count toward the roll, so they are counted apart. */
const bonusPicked = computed(
  () => game.tiles.flat().filter((t) => t.isInUse && t.isCollateral).length
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

/* Each tile answers with its own note; the board is the instrument. And the
   instrument opens up as the board empties — see `sound.tap`. */
const playClick = (face) => {
  sound.tap(face, game.sumTilesTaken / Math.max(1, game.rows * 45))
  buzz('tap')
}

const advance = () => {
  if (game.isLoading) return
  game.isLoading = true
  switch (game.state) {
    case 'isStart':
      sound.roll()
      buzz('roll')
      game.startGame()
      break
    case 'isNext':
      sound.roll()
      buzz('roll')
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
    // A roll matched and its tiles shut: the firmest of the small nudges.
    if (state === 'isNext') buzz('shut')
    if (state === 'isWin') {
      sound.win()
      buzz('win')
    } else if (state === 'isOver') {
      sound.over()
      buzz('over')
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

    <!-- ============================== playing ============================== -->
    <template v-if="!game.isFinished">
      <!-- Rendered whenever the mode is timed, and only filled during a turn:
           the board sizes itself from the space left over, so a clock that
           mounted and unmounted made every tile resize. -->
      <div
        v-if="game.mode.turnSeconds > 0"
        class="clock card-surface"
        :class="{ low: timerLow && inPlay, waiting: !inPlay }"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" class="clock-icon">
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4l2.500 2M9 2h6" />
        </svg>
        <span class="clock-track" aria-hidden="true">
          <span
            class="clock-fill"
            :style="{ width: `${(game.secondsLeft / game.mode.turnSeconds) * 100}%` }"
          />
        </span>
        <span class="timer num">
          <span class="visually-hidden">Time left </span>{{ game.secondsLeft }}s
        </span>
      </div>

      <div class="board-area">
        <!-- Pass & play: whose game this is, said before they touch anything. -->
        <Transition name="pop">
          <div
            v-if="match.active && match.stage !== 'done'"
            :key="match.stage"
            class="player-flag"
            role="status"
          >
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

        <!-- Runs, wilds and between-turn events announce themselves here. -->
        <Transition name="pop">
          <div v-if="game.celebration" :key="game.celebration.id" class="celebration">
            <strong class="display">{{ game.celebration.title }}</strong>
            <span>{{ game.celebration.detail }}</span>
          </div>
        </Transition>
      </div>

      <div class="footer">
        <!-- The roll, written as the sum the player is filling in. -->
        <div class="sum card-surface" :class="{ idle: game.state === 'isStart' }">
          <div class="sum-top">
            <button
              type="button"
              class="dice-button"
              :disabled="inPlay"
              :aria-label="inPlay ? 'Dice' : 'Roll the dice'"
              @click="onAction"
            >
              <template v-for="(die, i) in game.activeDice" :key="die.id">
                <span v-if="i > 0" class="op" aria-hidden="true">+</span>
                <DiceFace :value="die.number" />
              </template>
            </button>
            <template v-if="game.state !== 'isStart'">
              <span class="op" aria-hidden="true">=</span>
              <strong class="total num">{{ game.diceSum }}</strong>
            </template>
            <span class="sum-help">
              <template v-if="game.state === 'isStart'">Roll, then pick tiles that add up</template>
              <template v-else-if="game.state === 'isNext'">Turn done</template>
              <template v-else-if="game.waysToMatch.length > 1">
                {{ game.waysToMatch.length }} ways to make {{ game.remainingToMatch }}
              </template>
              <template v-else>Pick tiles that add up</template>
            </span>
          </div>

          <div class="picked" aria-live="polite">
            <template v-if="inPlay">
              <template v-for="(t, i) in game.selectedTiles" :key="t.id">
                <span v-if="i > 0" class="op small" aria-hidden="true">+</span>
                <span class="chip-tile num" :class="t.cssClass">{{ t.wildValue ?? t.index }}</span>
              </template>
              <span v-if="game.selectedTiles.length && game.remainingToMatch > 0" class="op small" aria-hidden="true">+</span>
              <span v-if="game.remainingToMatch > 0" class="to-go">
                <b class="num">{{ game.remainingToMatch }}</b> to go
              </span>
              <span v-if="bonusPicked" class="bonus-note">
                and {{ bonusPicked }} bonus {{ bonusPicked === 1 ? 'tile' : 'tiles' }}
              </span>
            </template>
            <span v-else-if="game.state === 'isNext'" class="idle-note">
              Those tiles are shut. Roll again.
            </span>
          </div>
        </div>

        <!-- One short block of help that changes with the move. Its height is
             reserved so the board above never resizes as it speaks. -->
        <div class="notes">
          <ul v-if="legend.length" class="legend">
            <li v-for="item in legend" :key="item.key">
              <span class="legend-mark" aria-hidden="true">{{ item.mark }}</span>
              <b>{{ item.name }}</b>
              <span class="roomy">{{ item.hint }}</span>
              <span class="tight">{{ item.brief }}</span>
            </li>
          </ul>
          <p v-if="showRunTip" class="run-tip">
            A tile with a <span class="tip-badge" aria-hidden="true">2</span> badge takes that many
            tiles in its column in one move.
          </p>
          <p v-if="game.mustRollSingleDie" class="single-note">
            One die: only {{ game.openTotal }} left on the board
          </p>
          <label v-if="game.canRollSingleDie && game.state === 'isNext'" class="single-die">
            <input type="checkbox" :checked="game.singleDie" @change="game.toggleSingleDie()" />
            Roll one die
          </label>
        </div>

        <div class="actions">
          <template v-if="inPlay">
            <button type="button" class="btn-quiet tool" :disabled="!game.canUndo" @click="doUndo">
              <AppIcon name="undo" /> Undo <kbd>U</kbd>
            </button>
            <button type="button" class="btn-quiet tool" @click="game.showHint()">
              <AppIcon name="bulb" /> Hint <kbd>H</kbd>
            </button>
          </template>
          <button
            v-else-if="button"
            ref="actionEl"
            type="button"
            class="btn-primary action-button"
            :disabled="game.isLoading"
            @click="onAction"
          >
            <AppIcon name="dice" />
            {{ button.message }}
            <kbd>Space</kbd>
          </button>
        </div>
      </div>
    </template>

    <!-- ============================== finished ============================= -->
    <div v-else class="result-view">
      <Confetti v-if="game.state === 'isWin'" />

      <!-- The hand-over: Player 1's score stays out of sight until both have played. -->
      <div v-if="isHandover" class="result handover">
        <div class="players">
          <div class="player card-surface">
            <span class="player-who">Player 1</span>
            <strong class="display">Done</strong>
            <span class="player-note">Score hidden</span>
          </div>
          <div class="player card-surface next">
            <span class="player-who">Player 2</span>
            <strong class="display">Your turn</strong>
            <span class="player-note">Same board</span>
          </div>
        </div>
        <h2 class="result-title display">Pass the phone to Player 2.</h2>
        <p class="handoff">
          You play the identical board. Player 1’s score stays hidden until you have both
          finished.
        </p>
        <button type="button" class="btn-primary again" @click="onAction">
          {{ button.message }}
        </button>
      </div>

      <div v-else class="result" :class="game.state">
        <!-- The card is the thing that gets shared, so it carries the whole
             result on its own: which game, how it ended, the board, the score. -->
        <div class="share-card" :class="{ won: game.state === 'isWin' && !matchDone }">
          <p class="eyebrow result-eyebrow">Shut The Cube · {{ resultLabel }}</p>
          <h2 class="result-title display">{{ endTitle }}</h2>
          <div
            class="blocks"
            :class="{ 'one-row': game.rows === 1 }"
            role="img"
            :aria-label="`The final board: ${shutCount} of ${blocks.length} tiles shut`"
          >
            <span v-for="b in blocks" :key="b.id" :class="{ shut: b.shut }" />
          </div>
          <p v-if="matchDone" class="match-scores">
            <span :class="{ winner: match.winner === 'p1' }">
              Player 1 <strong class="num">{{ match.results.p1.score }}</strong>
            </span>
            <span :class="{ winner: match.winner === 'p2' }">
              Player 2 <strong class="num">{{ match.results.p2.score }}</strong>
            </span>
          </p>
          <p v-else class="result-score">
            <strong class="num">{{ game.sumTilesTaken }}</strong>
            <span>of {{ game.rows * 45 }} points</span>
            <span class="rolls">{{ shutCount }} of {{ blocks.length }} shut · {{ rollsLabel }}</span>
          </p>
        </div>

        <div v-if="!matchDone" class="reason">
          <span class="final-dice">
            <DiceFace v-for="die in game.activeDice" :key="die.id" :value="die.number" />
          </span>
          <p>{{ endReason }}</p>
        </div>

        <p v-if="isPersonalBest" class="pb"><AppIcon name="trophy" /> New personal best</p>

        <!-- Where today's game landed against everyone else's, or the offer
             to put it there. Only ever for a ranked daily. -->
        <p v-if="arcade.lastRank" class="rank-line">
          <b class="num">#{{ arcade.lastRank }}</b> on today’s {{ game.mode.label }} board
        </p>
        <button
          v-else-if="rankable && !arcade.signedIn"
          type="button"
          class="post-cta"
          @click="postAndSignIn"
        >
          Put this score on the daily board
          <small>
            Sign in with {{ appleSignIn ? 'Apple' : 'Google' }} · your name only, no email
          </small>
        </button>
        <p v-else-if="arcade.postError" class="unranked-line" role="status">
          {{ arcade.postError }}
        </p>
        <p v-else-if="unranked" class="unranked-line">
          Free play isn’t ranked. Play today’s board from the Today tab to post a score.
        </p>

        <ShareScore v-if="!match.active || matchDone" :result="shareResult" />

        <!-- Offered once, at the moment it is most wanted: a daily just
             finished, in the installed app, with the reminder still off. -->
        <ReminderSwitch
          v-if="reminderAvailable && rankable && offerReminder"
          class="reminder-offer card-surface"
        />

        <div class="result-actions">
          <button type="button" class="btn-quiet again" @click="onAction">
            {{ button.message }} <kbd>Space</kbd>
          </button>
          <button v-if="rankable" type="button" class="btn-quiet" @click="emit('scores')">
            Today’s scores
          </button>
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
  gap: 0.5rem;
  min-height: 0;
}

/* ---------- Ninja's clock ---------- */
.clock {
  flex: none;
  margin: 0 0.75rem;
  height: 2.5rem;
  padding: 0 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-radius: 0.875rem;
  color: var(--bad);
}
.clock-icon {
  fill: none;
  stroke: currentcolor;
  stroke-width: 2.2;
  stroke-linecap: round;
}
.clock-track {
  flex: 1;
  height: 0.625rem;
  border-radius: 999px;
  background: var(--sunk);
  overflow: hidden;
}
.clock-fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--bad-fill);
  transition: width 1s linear;
}
.timer {
  min-width: 2.6ch;
  text-align: right;
  font-weight: 700;
  font-size: 1.25rem;
}
.clock.waiting {
  color: var(--muted);
}
.clock.waiting .clock-fill {
  background: var(--line-strong);
  transition: none;
}
.clock.low .timer {
  animation: timer-tick 1s ease-in-out infinite;
}
@keyframes timer-tick {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
}

/* ---------- the board ---------- */
/* The query container the tiles size themselves against. */
.board-area {
  position: relative;
  flex: 1;
  display: grid;
  place-items: center;
  min-height: 0;
  margin: 0 0.5rem;
  container-type: size;
}
.tile-position {
  position: relative;
  z-index: 1;
  padding: var(--pad) var(--pad) calc(var(--pad) - var(--gap));
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 1rem;
}

.player-flag {
  position: absolute;
  top: -0.25rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 6;
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  background: var(--ink);
  color: #ffffff;
  font-size: 0.8125rem;
  font-weight: 600;
  white-space: nowrap;
  pointer-events: none;
}

/*
 * A called-out moment lands on top of the board, so it can be over any tile
 * colour. It sits on an ink plate and is legible wherever it falls.
 */
.celebration {
  position: absolute;
  left: 50%;
  bottom: 10%;
  translate: -50% 0;
  z-index: 6;
  display: grid;
  justify-items: center;
  gap: 0.1rem;
  max-width: min(22rem, calc(100% - 2rem));
  padding: 0.6rem 1.25rem 0.7rem;
  background: var(--ink);
  border-radius: 1rem;
  box-shadow: 0 12px 32px rgb(21 35 28 / 30%);
  text-align: center;
  pointer-events: none;
}
.celebration strong {
  font-size: clamp(1.4rem, 6.5vmin, 2rem);
  font-weight: 700;
  line-height: 1.1;
  color: #ffffff;
}
.celebration span {
  font-size: 0.875rem;
  color: #c9d5cd;
}
.pop-enter-active {
  animation: pop-in 0.35s cubic-bezier(0.2, 1.5, 0.4, 1);
}
.pop-leave-active {
  transition: opacity 0.3s;
}
.pop-leave-to {
  opacity: 0;
}
@keyframes pop-in {
  0% {
    opacity: 0;
    scale: 0.7;
  }
  100% {
    opacity: 1;
    scale: 1;
  }
}

/* ---------- under the board ---------- */
.footer {
  flex: none;
  width: min(100%, 40rem);
  margin: 0 auto;
  box-sizing: border-box;
  padding: 0 0.75rem max(0.75rem, env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sum {
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}
.sum-top {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}
.dice-button {
  --die: 2.75rem;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0;
  background: none;
  border: 0;
  border-radius: 0.75rem;
  cursor: pointer;
}
.dice-button:disabled {
  cursor: default;
}
.sum.idle .dice-button {
  opacity: 0.45;
}
.op {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.375rem;
  color: var(--muted);
}
.op.small {
  font-size: 1.125rem;
}
.total {
  font-weight: 700;
  font-size: 2.5rem;
  line-height: 2.75rem;
}
.sum-help {
  margin-left: auto;
  max-width: 7.5rem;
  text-align: right;
  font-size: 0.8125rem;
  line-height: 1.3;
  color: var(--muted);
  text-wrap: balance;
}

/* Reserved to one chip's height, so picking a tile moves nothing. */
.picked {
  min-height: 2.5rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.375rem 0.5rem;
}
.chip-tile {
  width: 2.5rem;
  height: 2.5rem;
  display: grid;
  place-items: center;
  border-radius: 0.5rem;
  box-shadow: inset 0 0 0 2.5px var(--ink);
  color: var(--tile-ink);
  font-weight: 700;
  font-size: 1.1875rem;
  animation: chip-in 0.18s ease-out;
}
@keyframes chip-in {
  from {
    opacity: 0;
    scale: 0.7;
  }
}
.to-go {
  height: 2.5rem;
  padding: 0 0.875rem;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  border: 2px dashed var(--line-strong);
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
}
.bonus-note,
.idle-note {
  font-size: 0.875rem;
  color: var(--muted);
}
.idle-note b {
  color: var(--ink);
}

.notes {
  min-height: 2.75rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.15rem;
  text-align: center;
  font-size: 0.8125rem;
  line-height: 1.35;
  color: var(--muted);
}
.notes p {
  margin: 0;
}
.legend {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.1rem 0.9rem;
  justify-content: center;
}
.legend-mark {
  margin-right: 0.2rem;
}
.legend b,
.legend-mark {
  color: var(--ink);
  font-weight: 600;
}
.run-tip,
.single-note {
  color: var(--accent);
  font-weight: 500;
}
.tip-badge {
  display: inline-grid;
  place-items: center;
  width: 1rem;
  height: 1rem;
  font-size: 0.6875rem;
  font-weight: 700;
  color: var(--on-accent);
  background: var(--accent);
  border-radius: 999px;
  vertical-align: -2px;
}
.single-die {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 2.75rem;
  color: var(--ink);
  font-size: 0.9375rem;
  cursor: pointer;
}
.single-die input {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: var(--accent);
}

.actions {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 0.625rem;
  min-height: 3.5rem;
}
.actions .tool {
  min-height: 3.5rem;
}
.action-button:disabled {
  opacity: 0.6;
}

/* ---------- the result ---------- */
.result-view {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0.25rem 0.75rem max(1rem, env(safe-area-inset-bottom));
}
.result {
  width: min(100%, 26rem);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  animation: result-in 0.28s ease-out;
}
@keyframes result-in {
  from {
    opacity: 0;
    translate: 0 10px;
  }
}

.share-card {
  padding: 1.25rem 1.125rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  border-radius: 1.5rem;
  background: var(--surface);
  border: 1px solid var(--line);
}
.share-card.won {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--on-accent);
}
.share-card.won .eyebrow,
.share-card.won .result-score span {
  color: #c9f5da;
}
.result-title {
  margin: 0.25rem 0 0;
  font-size: clamp(1.75rem, 8vw, 2.5rem);
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: -0.015em;
  text-wrap: balance;
}
.blocks {
  display: grid;
  grid-template-columns: repeat(9, minmax(0, 1fr));
  gap: 3px;
}
.blocks span {
  height: 1.125rem;
  border-radius: 4px;
  box-sizing: border-box;
  border: 2px solid var(--ink);
  background: var(--surface);
}
.blocks.one-row span {
  height: 2.25rem;
  border-radius: 6px;
}
.blocks .shut {
  border: 0;
  background: var(--accent);
}
.share-card.won .blocks .shut {
  background: #7ff0ae;
}
.result-score {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.2rem 0.5rem;
}
.result-score strong {
  font-size: 2.75rem;
  line-height: 1;
  font-weight: 700;
}
.result-score span {
  font-size: 0.9375rem;
  color: var(--muted);
}
.result-score .rolls {
  margin-left: auto;
  font-size: 0.875rem;
}
.match-scores {
  margin: 0;
  display: flex;
  gap: 1.5rem;
  color: var(--muted);
  font-size: 0.9375rem;
}
.match-scores strong {
  display: block;
  font-size: 2.25rem;
  line-height: 1.1;
  font-weight: 700;
  color: var(--ink);
}
.match-scores .winner,
.match-scores .winner strong {
  color: var(--accent);
}

.reason {
  padding: 0.75rem 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-radius: 1rem;
  background: var(--sunk);
}
.final-dice {
  --die: 2.125rem;
  flex: none;
  display: flex;
  gap: 0.375rem;
}
.reason p {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.35;
}
.pb {
  align-self: flex-start;
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  background: var(--ink);
  color: #ffffff;
  font-weight: 600;
  font-size: 0.8125rem;
}
.rank-line,
.unranked-line {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.4;
  color: var(--muted);
}
.rank-line b {
  color: var(--accent);
  font-size: 1.05em;
}
/* The offer to post reads as an invitation, not a second primary button. */
.post-cta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0.75rem 0.875rem;
  border-radius: 1rem;
  border: 1px solid var(--accent);
  background: var(--accent-soft);
  color: var(--ink);
  font: inherit;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}
.post-cta small {
  font-weight: 400;
  font-size: 0.8125rem;
  color: var(--muted);
}
.result-actions {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 0.625rem;
}

.reminder-offer {
  padding: 0.25rem 0.875rem;
  border-radius: 1rem;
}

/* The hand-over. */
.handover {
  min-height: 100%;
  justify-content: center;
  gap: 1.25rem;
}
.players {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.625rem;
}
.player {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.player.next {
  border: 2px solid var(--accent);
}
.player-who {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--muted);
}
.player.next .player-who {
  color: var(--accent);
}
.player strong {
  font-size: 1.375rem;
  font-weight: 700;
}
.player-note {
  font-size: 0.8125rem;
  color: var(--muted);
}
.handoff {
  margin: 0;
  font-size: 1rem;
  line-height: 1.45;
  color: var(--muted);
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 6rem;
  translate: -50% 0;
  z-index: 8;
  margin: 0;
  padding: 0.5rem 0.875rem;
  border-radius: 0.75rem;
  background: var(--ink);
  color: #ffffff;
  font-size: 0.875rem;
  white-space: nowrap;
}

/* The short wording of a rule only shows where the long one cannot fit. */
.roomy,
.tight {
  margin-left: 0.25rem;
}
.tight {
  display: none;
}

/*
 * Short screens (an iPhone SE, a small Android). Everything under the board
 * is fixed height, so on a short screen it was the board that paid: nine rows
 * were left with tiles 22px high. Here the roll and the picked tiles share
 * one line, the rules take their short wording, and the first-game tip
 * steps aside, which gives the board back about a third of the screen.
 */
@media (max-height: 740px) {
  .Game {
    gap: 0.375rem;
  }
  .clock {
    height: 2rem;
  }
  .timer {
    font-size: 1.0625rem;
  }
  .footer {
    gap: 0.375rem;
    padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
  }
  .sum {
    flex-flow: row wrap;
    align-items: center;
    gap: 0.375rem 0.625rem;
    padding: 0.5rem 0.75rem;
  }
  .sum-top {
    gap: 0.4rem;
  }
  .dice-button {
    --die: 2rem;
    gap: 0.4rem;
  }
  .op {
    font-size: 1.125rem;
  }
  .total {
    font-size: 1.75rem;
    line-height: 2rem;
  }
  .sum-help {
    display: none;
  }
  .picked {
    min-height: 2rem;
    margin-left: auto;
    gap: 0.25rem 0.375rem;
  }
  .chip-tile {
    width: 2rem;
    height: 2rem;
    font-size: 1rem;
  }
  .to-go {
    height: 2rem;
    padding: 0 0.5rem;
    font-size: 0.8125rem;
  }
  .notes {
    min-height: 1.125rem;
  }
  .run-tip,
  .roomy {
    display: none;
  }
  .tight {
    display: inline;
  }
  .actions,
  .actions .tool {
    min-height: 2.75rem;
  }
  .action-button {
    min-height: 3rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pop-enter-active,
  .pop-leave-active,
  .result,
  .chip-tile,
  .clock.low .timer {
    animation: none;
    transition: none;
  }
  .clock-fill {
    transition: none;
  }
}
</style>
