import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'shutTheCube.stats'

const blank = () => ({
  played: 0,
  wins: 0,
  best: 0,
  last: 0,
  totalPoints: 0,
  streak: 0,
  bestStreak: 0
})

const read = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    return typeof stored === 'object' && stored !== null ? stored : {}
  } catch {
    // Private browsing, disabled storage, or corrupt data: start fresh.
    return {}
  }
}

/** Per-mode records, kept in the browser. No account, no backend. */
export const useStatsStore = defineStore('stats', () => {
  const byMode = ref(read())

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

  const record = (key, score, won) => {
    const previous = forMode(key)
    const streak = won ? previous.streak + 1 : 0
    byMode.value = {
      ...byMode.value,
      [key]: {
        played: previous.played + 1,
        wins: previous.wins + (won ? 1 : 0),
        best: Math.max(previous.best, score),
        last: score,
        totalPoints: previous.totalPoints + score,
        streak,
        bestStreak: Math.max(previous.bestStreak, streak)
      }
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(byMode.value))
    } catch {
      // Not being able to persist a score is not worth interrupting play.
    }
    return score > previous.best
  }

  const reset = () => {
    byMode.value = {}
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Nothing to do if storage is unavailable.
    }
  }

  return { byMode, forMode, bestFor, averageFor, winRateFor, hasPlayed, record, reset }
})
