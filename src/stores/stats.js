import { defineStore } from 'pinia'
import { ref } from 'vue'
import { streakOf, todayStamp } from '@/services/random'

const STORAGE_KEY = 'shutTheCube.stats'
const DAILY_KEY = 'shutTheCube.daily'

/** How many days of history to keep. Enough for any streak worth showing. */
const DAY_MEMORY = 90

const blank = () => ({
  played: 0,
  wins: 0,
  best: 0,
  last: 0,
  totalPoints: 0,
  streak: 0,
  bestStreak: 0,
  /** Distinct dates this mode was played, oldest first. */
  days: []
})

const read = (key) => {
  try {
    const stored = JSON.parse(localStorage.getItem(key) ?? '{}')
    return typeof stored === 'object' && stored !== null ? stored : {}
  } catch {
    // Private browsing, disabled storage, or corrupt data: start fresh.
    return {}
  }
}

const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Not being able to persist a score is not worth interrupting play.
  }
}

/** Per-mode records, kept in the browser. No account, no backend. */
export const useStatsStore = defineStore('stats', () => {
  const byMode = ref(read(STORAGE_KEY))
  /** Finished dailies, as `{ [date]: { [mode]: { score, won, rolls } } }`. */
  const dailies = ref(read(DAILY_KEY))

  const forMode = (key) => ({ ...blank(), ...(byMode.value[key] ?? {}) })

  const bestFor = (key) => forMode(key).best

  const averageFor = (key) => {
    const s = forMode(key)
    return s.played ? Math.round(s.totalPoints / s.played) : 0
  }

  const winRateFor = (key) => {
    const s = forMode(key)
    return s.played ? Math.round((s.wins / s.played) * 100) : 0
  }

  const hasPlayed = (key) => forMode(key).played > 0

  /** Consecutive days this one mode was played. */
  const streakForMode = (key) => streakOf(forMode(key).days)

  /**
   * Consecutive days *anything* was played.
   *
   * The streak worth protecting is the habit, not the mode — playing Ninja
   * yesterday and Beginner today is still two days in a row.
   */
  const dayStreak = () => {
    const days = new Set()
    for (const stats of Object.values(byMode.value)) {
      for (const day of stats?.days ?? []) days.add(day)
    }
    return streakOf([...days])
  }

  const record = (key, score, won, { stamp = todayStamp() } = {}) => {
    const previous = forMode(key)
    const streak = won ? previous.streak + 1 : 0
    const days = previous.days.includes(stamp)
      ? previous.days
      : [...previous.days, stamp].slice(-DAY_MEMORY)
    byMode.value = {
      ...byMode.value,
      [key]: {
        played: previous.played + 1,
        wins: previous.wins + (won ? 1 : 0),
        best: Math.max(previous.best, score),
        last: score,
        totalPoints: previous.totalPoints + score,
        streak,
        bestStreak: Math.max(previous.bestStreak, streak),
        days
      }
    }
    write(STORAGE_KEY, byMode.value)
    return score > previous.best
  }

  /** What you scored on a given day's board, or null if you have not played it. */
  const dailyResult = (key, stamp = todayStamp()) => dailies.value[stamp]?.[key] ?? null

  /**
   * Bank a daily result. Only the first attempt counts — replaying the same
   * board is practice, and overwriting it would make the day's score mean
   * nothing.
   */
  const recordDaily = (key, stamp, result) => {
    if (dailyResult(key, stamp)) return false
    const kept = Object.fromEntries(
      Object.entries({
        ...dailies.value,
        [stamp]: { ...(dailies.value[stamp] ?? {}), [key]: { ...result, posted: false } }
      })
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .slice(-DAY_MEMORY)
    )
    dailies.value = kept
    write(DAILY_KEY, dailies.value)
    return true
  }

  /**
   * Dailies finished on this device that never reached the leaderboard —
   * played before signing in, or while it was unreachable.
   *
   * The move list is kept with them, because without it the server has nothing
   * to check the score against and could only take it on trust.
   */
  const unpostedDailies = () => {
    const out = []
    for (const [stamp, modes] of Object.entries(dailies.value)) {
      for (const [mode, result] of Object.entries(modes ?? {})) {
        if (result?.posted || result?.seed == null || !Array.isArray(result?.turns)) continue
        out.push({ mode, period: stamp, ...result })
      }
    }
    return out
  }

  const markPosted = (key, stamp) => {
    const existing = dailies.value[stamp]?.[key]
    if (!existing) return
    dailies.value = {
      ...dailies.value,
      [stamp]: { ...dailies.value[stamp], [key]: { ...existing, posted: true } }
    }
    write(DAILY_KEY, dailies.value)
  }

  const reset = () => {
    byMode.value = {}
    dailies.value = {}
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(DAILY_KEY)
    } catch {
      // Nothing to do if storage is unavailable.
    }
  }

  return {
    byMode,
    dailies,
    forMode,
    bestFor,
    averageFor,
    winRateFor,
    hasPlayed,
    streakForMode,
    dayStreak,
    record,
    dailyResult,
    recordDaily,
    unpostedDailies,
    markPosted,
    reset
  }
})
