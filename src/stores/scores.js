import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'shutTheCube.bestScores'

/** Best score per board size, persisted in the browser. */
const read = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    return typeof stored === 'object' && stored !== null ? stored : {}
  } catch {
    // Private browsing, disabled storage, or corrupt data: start fresh.
    return {}
  }
}

export const useScoresStore = defineStore('scores', () => {
  const best = ref(read())

  const bestFor = (rows) => best.value[rows] ?? 0

  const record = (rows, score) => {
    if (!Number.isFinite(score) || score <= bestFor(rows)) return false
    best.value = { ...best.value, [rows]: score }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(best.value))
    } catch {
      // Not being able to persist a high score is not worth interrupting play.
    }
    return true
  }

  return { best, bestFor, record }
})
