<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useGameStore } from '@/stores/game'
import { useMatchStore } from '@/stores/match'
import { useStatsStore } from '@/stores/stats'
import { useArcadeStore } from '@/stores/arcade'
import { MODE_LIST } from '@/stores/modes'
import { isMobile } from '@/services/gameServices'
import { dayNumber, secondsUntilTomorrow, todayStamp } from '@/services/random'
import { useInstallPrompt } from '@/composables/useInstallPrompt'
import AppIcon from '@/components/AppIcon.vue'
import BrandMark from '@/components/BrandMark.vue'
import GameBoard from '@/components/GameBoard.vue'
import GameHeader from '@/components/GameHeader.vue'
import ModeMark from '@/components/ModeMark.vue'
import ScoresPanel from '@/components/ScoresPanel.vue'

const game = useGameStore()
const match = useMatchStore()
const stats = useStatsStore()
const arcade = useArcadeStore()
const { canInstall, prompt } = useInstallPrompt()
const onMobile = ref(false)
/** null when closed, otherwise which side of the scores panel to open on. */
const scores = ref(null)
const version = __APP_VERSION__

/* Short enough for a card; each card is the whole pitch for its mode. */
const SUBS = {
  beginner: 'One row, the classic pub game.',
  medium: 'Nine rows — matching columns collapse for a bonus.',
  ninja: 'Nine rows against the clock. 30 seconds a turn.'
}

/** 1 = solo, 2 = pass-and-play on this device. */
const players = ref(1)
/**
 * Whether the mode cards deal today's shared board instead of a random one.
 *
 * Remembered, because it was not: every trip back to the menu silently turned
 * it off again, so a second game quietly stopped counting for the leaderboard
 * with nothing on screen to say so.
 */
const DAILY_PREF = 'shutTheCube.dailyPreferred'
const daily = ref(
  (() => {
    try {
      return localStorage.getItem(DAILY_PREF) === '1'
    } catch {
      return false
    }
  })()
)
watch(daily, (on) => {
  try {
    localStorage.setItem(DAILY_PREF, on ? '1' : '0')
  } catch {
    // A preference that cannot be stored still holds for this visit.
  }
})

const today = todayStamp()
const dayLabel = dayNumber(today)
const untilTomorrow = ref(secondsUntilTomorrow())
let countdown = null

/** How long until the next board, as `7h 12m`. */
const countdownLabel = computed(() => {
  const h = Math.floor(untilTomorrow.value / 3600)
  const m = Math.floor((untilTomorrow.value % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
})

const streak = computed(() => stats.dayStreak())

/**
 * The mode to open on.
 *
 * Remembered, because the menu was a decision standing between arriving and
 * playing, and every decision before the first roll costs someone who has not
 * played yet. Medium is the opening hand for a first visit: it is the variant
 * the game is named after, and the run preview and the one-time tip already
 * teach its only novel rule.
 */
const LAST_MODE = 'shutTheCube.lastMode'
const rememberedMode = () => {
  try {
    const saved = localStorage.getItem(LAST_MODE)
    return MODE_LIST.some((m) => m.key === saved) ? saved : 'medium'
  } catch {
    return 'medium'
  }
}

const start = (key, options = {}) => {
  match.reset()
  try {
    localStorage.setItem(LAST_MODE, key)
  } catch {
    // A preference that cannot be stored still holds for this visit.
  }
  // Pass and play needs both players on one board, which the daily already
  // guarantees — but a match is a private contest, so it stays unseeded.
  const seeded = players.value === 1 && daily.value
  game.newGame(key, null, seeded ? { daily: true, stamp: today } : options)
  if (players.value === 2) match.begin(key, game.tiles)
  game.isVisible = true
}

/* Menu keyboard: 1-3 deals you straight into that mode. */
const onMenuKeydown = (event) => {
  if (game.isVisible || scores.value) return
  if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return
  const n = parseInt(event.key, 10)
  if (n >= 1 && n <= MODE_LIST.length) start(MODE_LIST[n - 1].key)
}

onMounted(() => {
  onMobile.value = isMobile()
  window.addEventListener('keydown', onMenuKeydown)
  // Optional throughout: a failure here leaves the game exactly as it was.
  arcade.restore()
  // The countdown only has to be roughly right, so it ticks once a minute
  // rather than once a second.
  countdown = setInterval(() => (untilTomorrow.value = secondsUntilTomorrow()), 60_000)

  // A shared challenge link deals the recipient straight in. `s` carries the
  // seed, which is the whole point: without it they would get a different
  // board and there would be nothing to beat.
  const params = new URLSearchParams(window.location.search)
  const dared = params.get('mode')
  const sharedSeed = params.get('s')
  if (dared && MODE_LIST.some((m) => m.key === dared)) {
    start(dared, sharedSeed !== null ? { seed: sharedSeed } : {})
    return
  }

  /*
   * Otherwise open straight onto a board, ready to roll. The menu is one tap
   * away on the header, and everything it offered — the other modes, the
   * daily, the boards — is still there for anyone who goes looking.
   */
  start(rememberedMode())
})
onUnmounted(() => {
  window.removeEventListener('keydown', onMenuKeydown)
  clearInterval(countdown)
})
</script>

<template>
  <div
    class="shell"
    :class="{ isMobile: onMobile, shutTheBox: game.rows === 1 }"
    :data-mode="game.isVisible ? game.modeKey : null"
  >
    <div class="aurora" aria-hidden="true"><i></i><i></i><i></i></div>

    <div id="warning-message">
      <div class="warning">
        <BrandMark :size="48" />
        <p>This app is only playable in portrait.</p>
      </div>
    </div>

    <div id="app">
      <h1 v-if="!game.isVisible" class="visually-hidden">Shut The Cube: Play Shut the Box Online</h1>
      <GameHeader v-if="game.isVisible" />

      <div v-if="!game.isVisible" class="menu-wrap">
        <ScoresPanel v-if="scores" :start="scores" @close="scores = null" />

        <div v-else class="menu">
          <div class="lockup">
            <BrandMark :size="56" />
            <h2 class="wordmark display" aria-hidden="true">
              <span>Shut</span> <span>The</span> <span>Cube</span>
            </h2>
          </div>
          <p class="tagline">
            Roll the dice, shut the tiles that match. Clear the board and the box is yours.
          </p>

          <div class="players" role="group" aria-label="Players">
            <button type="button" class="pill" :aria-pressed="players === 1" @click="players = 1">
              Solo
            </button>
            <button type="button" class="pill" :aria-pressed="players === 2" @click="players = 2">
              Pass &amp; play
              <small>2 players · same board · one device</small>
            </button>
          </div>

          <!-- The daily is a modifier on a mode, not a fourth mode: every mode
               has its own board each day, and you pick which one to play. -->
          <div v-if="players === 1" class="daily-row">
            <button
              type="button"
              class="pill daily-pill"
              :aria-pressed="daily"
              @click="daily = !daily"
            >
              Daily <b class="num">#{{ dayLabel }}</b>
              <small>
                Same board for everyone · counts on the leaderboard · new in
                {{ countdownLabel }}
              </small>
            </button>
            <p v-if="streak > 1" class="streak num" :title="`${streak} days in a row`">
              🔥 {{ streak }}
            </p>
          </div>

          <ul class="cards">
            <li v-for="(mode, i) in MODE_LIST" :key="mode.key">
              <button
                type="button"
                class="card"
                :data-mode="mode.key"
                @click="start(mode.key)"
              >
                <span class="art"><ModeMark :mode="mode.key" /></span>
                <span class="copy">
                  <span class="card-name display">{{ mode.label }}</span>
                  <span class="card-sub">{{ SUBS[mode.key] }}</span>
                  <span class="card-foot micro">
                    <span class="go">Play <kbd>{{ i + 1 }}</kbd></span>
                    <span
                      v-if="daily && players === 1 && stats.dailyResult(mode.key, today)"
                      class="card-best num done"
                    >
                      today {{ stats.dailyResult(mode.key, today).score }}
                    </span>
                    <span v-else-if="stats.hasPlayed(mode.key)" class="card-best num">
                      best {{ stats.bestFor(mode.key) }}
                    </span>
                  </span>
                </span>
              </button>
            </li>
          </ul>

          <div class="kbd-row" aria-hidden="true">
            <span><b>1–3</b>play</span>
            <span><b>Space</b>roll</span>
            <span><b>H</b>hint</span>
            <span><b>U</b>undo</span>
          </div>

          <div class="menu-foot">
            <button type="button" class="record-link" @click="scores = 'you'">
              <AppIcon name="trophy" /> Scores &amp; leaderboard
            </button>
            <button v-if="canInstall" type="button" class="install" @click="prompt">
              Add to home screen
            </button>
            <nav class="resource-links" aria-label="Game information">
              <a href="how-to-play.html">How to play</a>
              <a href="about.html">About</a>
              <a href="privacy.html">Privacy</a>
              <span class="version">v{{ version }}</span>
            </nav>
          </div>
        </div>
      </div>

      <GameBoard v-if="game.isVisible" @scores="game.isVisible = false; scores = 'board'" />
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
/* Above the aurora, which is fixed at z-index 0. */
#app {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  width: 100%;
  max-width: 46rem;
  margin: 0 auto;
}

.warning {
  position: relative;
  z-index: 1;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: var(--ground-2);
  color: var(--bone);
}

/* Menus may exceed a short viewport — scroll, and centre only when it fits. */
.menu-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: safe center;
  padding: 1.25rem;
  overflow-y: auto;
  overscroll-behavior: contain;
}
.menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.lockup {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-bottom: 10px;
}
.wordmark {
  margin: 0;
  font-weight: 700;
  font-size: clamp(26px, 6vw, 44px);
  line-height: 1.05;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--bone);
  text-shadow: 0 0 30px color-mix(in srgb, var(--accent) 30%, transparent);
}
.wordmark span {
  display: inline-block;
  opacity: 0;
  animation: word-hit 0.48s cubic-bezier(0.2, 0.9, 0.25, 1.25) forwards;
}
.wordmark span:nth-child(2) {
  animation-delay: 0.1s;
}
.wordmark span:nth-child(3) {
  animation-delay: 0.2s;
}
@keyframes word-hit {
  0% {
    opacity: 0;
    transform: translateY(12px) scale(0.88);
    filter: blur(5px);
  }
  58% {
    opacity: 1;
    transform: translateY(-2px) scale(1.045);
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

.tagline {
  color: var(--muted);
  max-width: 40ch;
  line-height: 1.6;
  font-size: 14px;
  margin: 0 0 clamp(18px, 3.5vh, 36px);
}

.players {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 10px;
}

/*
 * The daily sits between the player toggle and the modes because that is the
 * order of the decision: who is playing, which board, then which mode.
 */
.daily-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: clamp(14px, 2.5vh, 22px);
}
.daily-pill b {
  color: var(--accent);
  margin-left: 2px;
}
.daily-pill[aria-pressed='true'] b {
  color: inherit;
}
.streak {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  color: var(--text-dim);
}
/* A finished daily reads as done rather than as a record to beat. */
.card-best.done {
  color: var(--accent);
}

/*
 * The mode cards. Each wears its own accent (via [data-mode]) the way its
 * board will, so the card you press and the game you land in are
 * recognisably the same thing.
 */
.cards {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-auto-rows: 1fr;
  gap: 12px;
  width: min(100%, 24rem);
}
.cards li {
  display: grid;
  animation: card-rise 0.5s cubic-bezier(0.2, 0.9, 0.25, 1.15) backwards;
}
.cards li:nth-child(1) {
  animation-delay: 0.28s;
}
.cards li:nth-child(2) {
  animation-delay: 0.38s;
}
.cards li:nth-child(3) {
  animation-delay: 0.48s;
}
@keyframes card-rise {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.card {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 108px 1fr;
  align-items: center;
  gap: 14px;
  text-align: left;
  padding: 14px;
  font: inherit;
  color: var(--bone);
  background: rgb(9 29 22 / 55%);
  border: 1px solid var(--line);
  border-radius: 18px;
  cursor: pointer;
  position: relative;
  isolation: isolate;
  transition: transform 0.12s, border-color 0.12s, box-shadow 0.12s;
}
/* The accent's wash, in the card's own corner. */
.card::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  pointer-events: none;
  background: radial-gradient(
    140% 120% at 86% 0%,
    color-mix(in srgb, var(--accent) 16%, transparent),
    transparent 62%
  );
  opacity: 0;
  transition: opacity 0.18s;
}
.card:hover,
.card:focus-visible {
  transform: translateY(-3px);
  border-color: color-mix(in srgb, var(--accent) 62%, transparent);
  box-shadow:
    0 12px 40px color-mix(in srgb, var(--accent) 16%, transparent),
    0 2px 14px color-mix(in srgb, var(--accent) 12%, transparent);
}
.card:hover::before,
.card:focus-visible::before {
  opacity: 1;
}
.art {
  display: block;
  height: 44px;
  align-self: center;
  color: var(--accent);
}
.copy {
  display: grid;
  gap: 3px;
  min-width: 0;
  height: 100%;
  align-content: start;
}
.card-name {
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}
.card-sub {
  font-size: 12px;
  line-height: 1.45;
  color: var(--muted);
}
.card-foot {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
  padding-top: 5px;
  font-size: 10px;
}
.card:hover .go,
.card:focus-visible .go {
  color: var(--accent);
}
.card-best {
  color: var(--accent);
  letter-spacing: 0.06em;
}

.kbd-row {
  margin-top: clamp(18px, 3vh, 28px);
}

.menu-foot {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: clamp(14px, 2.5vh, 24px);
}
.record-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: none;
  border: 0;
  padding: 0.2rem 0.4rem;
  font: inherit;
  font-size: 12px;
  color: var(--muted);
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}
.record-link:hover {
  color: var(--bone);
}
.install {
  display: block;
  margin: 0.8rem auto 0;
  background: none;
  border: 0;
  color: var(--muted);
  font: inherit;
  font-size: 12px;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}
.resource-links {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 1rem;
  margin-top: 0.9rem;
  font-size: 12px;
}
.resource-links a {
  color: var(--muted);
  text-decoration: none;
  border-bottom: 1px solid var(--line);
  padding-bottom: 1px;
}
.resource-links a:hover {
  color: var(--bone);
  border-bottom-color: var(--bone);
}
.version {
  font-size: 10px;
  color: var(--muted);
  opacity: 0.6;
}

/* Wide screens: the three cards sit side by side, art on top. */
@media (min-width: 700px) {
  .cards {
    grid-template-columns: repeat(3, 1fr);
    width: min(100%, 42rem);
  }
  .card {
    grid-template-columns: 1fr;
    align-content: start;
    gap: 10px;
    padding: 18px 16px 14px;
  }
  .art {
    height: 54px;
  }
}

/* Thumbs get no keyboard hints. */
@media (hover: none) and (pointer: coarse), (max-width: 640px) {
  .kbd-row {
    display: none;
  }
  .card .go kbd {
    display: none;
  }
  .card:hover {
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .wordmark span {
    animation: none;
    opacity: 1;
  }
  .cards li {
    animation: none;
  }
  .card,
  .card:hover,
  .card:focus-visible {
    transition: none;
    transform: none;
  }
}
</style>
