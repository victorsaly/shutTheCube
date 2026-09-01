import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

/**
 * Pass-and-play: two players on one device, alternating full games of the
 * same mode on the same board — identical faces and identical special-tile
 * placement, your own dice. Player 1 finishes, hands the device over, and
 * the higher banked total takes the match.
 *
 * This store is pure match bookkeeping. It never reaches into the game store;
 * the game store reports finished games to it, and the board orchestrates the
 * handoff — so there is no import cycle and the turn machine stays untouched.
 */
export const useMatchStore = defineStore('match', () => {
  const active = ref(false)
  /** 'p1' | 'p2' | 'done' */
  const stage = ref('p1')
  const modeKey = ref('medium')
  /** The board both players get: faces and specials, no play state. */
  const layout = ref(null)
  const results = ref({ p1: null, p2: null })

  /** Keep only what defines the board — every play flag is rebuilt fresh. */
  const snapshot = (tiles) =>
    tiles.map((row) => row.map(({ id, index, kind, cssClass }) => ({ id, index, kind, cssClass })))

  /** Start a match on the board the game store just built. */
  const begin = (key, tiles) => {
    active.value = true
    stage.value = 'p1'
    modeKey.value = key
    layout.value = snapshot(tiles)
    results.value = { p1: null, p2: null }
  }

  /** A finished game, reported by the game store instead of the solo stats. */
  const record = (score, won, rolls) => {
    if (!active.value) return
    if (stage.value === 'p1') {
      results.value = { ...results.value, p1: { score, won, rolls } }
    } else if (stage.value === 'p2') {
      results.value = { ...results.value, p2: { score, won, rolls } }
      stage.value = 'done'
    }
  }

  /** Player 1 has handed the device over. */
  const advance = () => {
    if (stage.value === 'p1') stage.value = 'p2'
  }

  const reset = () => {
    active.value = false
    stage.value = 'p1'
    layout.value = null
    results.value = { p1: null, p2: null }
  }

  /** What Player 2 is chasing. */
  const target = computed(() => results.value.p1?.score ?? 0)

  /**
   * Higher total wins. If the totals tie and both shut the box, fewer rolls
   * is the cleaner game; any other tie is an honest draw.
   */
  const winner = computed(() => {
    const { p1, p2 } = results.value
    if (!p1 || !p2) return ''
    if (p1.score !== p2.score) return p1.score > p2.score ? 'p1' : 'p2'
    if (p1.won && p2.won && p1.rolls !== p2.rolls) return p1.rolls < p2.rolls ? 'p1' : 'p2'
    return 'draw'
  })

  return { active, stage, modeKey, layout, results, begin, record, advance, reset, target, winner }
})
