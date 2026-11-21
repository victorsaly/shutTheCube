<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useGameStore } from '@/stores/game'
import { useMatchStore } from '@/stores/match'
import { useArcadeStore } from '@/stores/arcade'
import { MODE_LIST } from '@/stores/modes'
import { isMobile } from '@/services/gameServices'
import { todayStamp } from '@/services/random'
import { APP_REDIRECT, isNative } from '@/services/native'
import { syncReminder } from '@/services/reminder'
import { useStatsStore } from '@/stores/stats'
import BrandMark from '@/components/BrandMark.vue'
import GameBoard from '@/components/GameBoard.vue'
import GameHeader from '@/components/GameHeader.vue'
import Leaderboard from '@/components/Leaderboard.vue'
import PlayTab from '@/components/PlayTab.vue'
import TodayTab from '@/components/TodayTab.vue'
import YouTab from '@/components/YouTab.vue'

const game = useGameStore()
const match = useMatchStore()
const arcade = useArcadeStore()
const onMobile = ref(false)

/*
 * Four tabs, and the app opens on Today: the day's shared board is the
 * reason to come back, so it is the first thing on the screen, one tap from
 * playing. A game takes the whole screen and the tabs wait underneath it.
 */
const TABS = [
  { key: 'today', label: 'Today' },
  { key: 'play', label: 'Play' },
  { key: 'scores', label: 'Scores' },
  { key: 'you', label: 'You' }
]
const tab = ref('today')

/* The mode last played, so Today offers that board first. */
const LAST_MODE = 'shutTheCube.lastMode'
const rememberedMode = () => {
  try {
    const saved = localStorage.getItem(LAST_MODE)
    return MODE_LIST.some((m) => m.key === saved) ? saved : 'medium'
  } catch {
    return 'medium'
  }
}
const lastMode = ref(rememberedMode())

/**
 * Deal a board and show it.
 *
 *   daily    today's shared board, the one that counts on the leaderboard
 *   seed     a board shared by link
 *   players  2 for pass and play, which is a private contest and never seeded
 */
const start = (key, { daily = false, seed = null, players = 1 } = {}) => {
  match.reset()
  lastMode.value = key
  try {
    localStorage.setItem(LAST_MODE, key)
  } catch {
    // A preference that cannot be stored still holds for this visit.
  }
  const options =
    players === 1 && daily
      ? { daily: true, stamp: todayStamp() }
      : seed !== null
        ? { seed }
        : {}
  game.newGame(key, null, options)
  if (players === 2) match.begin(key, game.tiles)
  game.isVisible = true
}

const openScores = () => {
  game.isVisible = false
  match.reset()
  tab.value = 'scores'
}

/* On the tabs, 1 to 3 deals you straight into that mode. */
const onKeydown = (event) => {
  if (game.isVisible || event.target.tagName === 'INPUT') return
  if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return
  const n = parseInt(event.key, 10)
  if (n >= 1 && n <= MODE_LIST.length) start(MODE_LIST[n - 1].key)
}

/*
 * Android's back button. It steps out the way the screen suggests: a game
 * that has not started (or has finished) closes, any other tab returns to
 * Today, and from Today the app goes to the background. A game in progress
 * is left alone, because one stray swipe from the edge should not throw a
 * board away; the close button in the header asks twice for the same reason.
 */
let backHandle = null
const listenForBack = async () => {
  const { App: NativeApp } = await import('@capacitor/app')
  backHandle = await NativeApp.addListener('backButton', () => {
    if (game.isVisible) {
      const inProgress = game.numberPlay > 0 && !game.isFinished
      if (inProgress || match.active) return
      game.isVisible = false
    } else if (tab.value !== 'today') {
      tab.value = 'today'
    } else {
      NativeApp.minimizeApp()
    }
  })
}

/*
 * A sign-in started in the app finishes in the phone's browser, which sends
 * the player to the app's own address. The phone hands that address to the
 * app, and the one-time code on it becomes the session.
 */
let signInHandle = null
const onAppSignIn = async () => {
  const { App: NativeApp } = await import('@capacitor/app')
  signInHandle = await NativeApp.addListener('appUrlOpen', async ({ url }) => {
    if (!url?.startsWith(APP_REDIRECT)) return
    const code = new URL(url).searchParams.get('auth')
    // iOS leaves its browser sheet up until told; Android has none to close.
    import('@capacitor/browser').then(({ Browser }) => Browser.close()).catch(() => {})
    await arcade.finishSignIn(code)
  })
}

onMounted(() => {
  onMobile.value = isMobile()
  window.addEventListener('keydown', onKeydown)
  if (isNative) {
    listenForBack()
    onAppSignIn()
    // Top the fortnight of reminders back up, minus today if it is played.
    const stats = useStatsStore()
    syncReminder({ playedToday: MODE_LIST.some((m) => stats.dailyResult(m.key)) })
  }
  // Optional throughout: a failure here leaves the game exactly as it was.
  arcade.restore()

  // A shared challenge link deals the recipient straight in. `s` carries the
  // seed, which is the whole point: without it they would get a different
  // board and there would be nothing to beat.
  const params = new URLSearchParams(window.location.search)
  const dared = params.get('mode')
  const sharedSeed = params.get('s')
  if (dared && MODE_LIST.some((m) => m.key === dared)) {
    start(dared, { seed: sharedSeed })
  }
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  backHandle?.remove()
  signInHandle?.remove()
})
</script>

<template>
  <div class="shell" :class="{ isMobile: onMobile }">
    <div id="warning-message">
      <div class="warning">
        <BrandMark :size="48" />
        <p>This app is only playable in portrait.</p>
      </div>
    </div>

    <div id="app">
      <template v-if="game.isVisible">
        <h1 class="visually-hidden">Shut The Cube: {{ game.mode.label }}</h1>
        <GameHeader />
        <GameBoard @scores="openScores" />
      </template>

      <template v-else>
        <main class="page">
          <div class="column">
            <TodayTab
              v-if="tab === 'today'"
              :initial-mode="lastMode"
              @start="start"
              @scores="tab = 'scores'"
            />
            <PlayTab v-else-if="tab === 'play'" @start="start" />
            <section v-else-if="tab === 'scores'" class="scores">
              <h1 class="display">Scores</h1>
              <p class="lede">Only the Daily counts here, and only your first try each day.</p>
              <Leaderboard embedded />
            </section>
            <YouTab v-else @scores="tab = 'scores'" />
          </div>
        </main>

        <nav class="tabbar" aria-label="Main">
          <div class="tabs">
            <button
              v-for="t in TABS"
              :key="t.key"
              type="button"
              class="tab"
              :aria-current="tab === t.key ? 'page' : undefined"
              @click="tab = t.key"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                <template v-if="t.key === 'today'">
                  <rect x="3" y="5" width="18" height="16" rx="3" />
                  <path d="M3 10h18M8 3v4M16 3v4" />
                </template>
                <template v-else-if="t.key === 'play'">
                  <rect x="3" y="3" width="18" height="18" rx="4" />
                  <circle cx="8.5" cy="8.5" r="1.2" class="dot" />
                  <circle cx="12" cy="12" r="1.2" class="dot" />
                  <circle cx="15.5" cy="15.5" r="1.2" class="dot" />
                </template>
                <template v-else-if="t.key === 'scores'">
                  <path d="M5 21V10M12 21V4M19 21v-7" />
                </template>
                <template v-else>
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
                </template>
              </svg>
              {{ t.label }}
            </button>
          </div>
        </nav>
      </template>
    </div>
  </div>
</template>

<style scoped>
/*
 * An explicit height, not just a minimum: size containment on the board area
 * can only resolve its block axis if the flex chain above it is definite.
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
}

.warning {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: var(--bg);
  color: var(--ink);
}

/* A tab's page scrolls on its own; the tab bar stays put beneath it. */
.page {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: max(1.5rem, calc(env(safe-area-inset-top) + 0.75rem)) 1.25rem 1.5rem;
}
.column {
  width: min(100%, 28rem);
  margin: 0 auto;
}

.scores {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}
.scores h1 {
  margin: 0;
  font-weight: 700;
  font-size: 2.125rem;
  line-height: 1.1;
  letter-spacing: -0.01em;
}
.lede {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.4;
  color: var(--muted);
}

.tabbar {
  flex: none;
  background: var(--surface);
  border-top: 1px solid var(--line);
  padding: 0.375rem 0.75rem max(0.375rem, env(safe-area-inset-bottom));
}
.tabs {
  width: min(100%, 28rem);
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}
.tab {
  min-height: 3.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  border: 0;
  border-radius: 0.75rem;
  background: none;
  color: var(--muted);
  font: inherit;
  font-size: 0.6875rem;
  font-weight: 600;
  cursor: pointer;
}
.tab svg {
  fill: none;
  stroke: currentcolor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.tab .dot {
  fill: currentcolor;
  stroke: none;
}
.tab[aria-current='page'] {
  color: var(--accent);
}
.tab[aria-current='page'] svg {
  stroke-width: 2.5;
}
.tab:hover {
  color: var(--ink);
}
.tab[aria-current='page']:hover {
  color: var(--accent);
}
</style>
