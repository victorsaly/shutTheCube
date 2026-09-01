import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { sum } from 'lodash-es'
import {
  createTiles,
  getTilesIndexCombinations,
  moveTile,
  shuffle,
  subsetsSummingTo,
  sumTilesWhere
} from '@/services/gameServices'
import { modeFor } from './modes'
import { useStatsStore } from './stats'

/** Face value of a complete row, 1+2+…+9. */
const ROW_TOTAL = 45

const newDice = () => [
  { id: 1, number: 0, isAvailable: true },
  { id: 2, number: 0, isAvailable: true }
]

/**
 * The whole game: the board and the state machine that drives it.
 *
 * States: 'isStart' (waiting for the first roll), '' (dice rolled, pick tiles),
 * 'isNext' (turn complete, roll again), 'isOver' (no legal move), 'isWin'.
 */
export const useGameStore = defineStore('game', () => {
  const tiles = ref([])
  const dice = ref(newDice())
  const state = ref('isStart')
  const note = ref('Start Game')
  const numberPlay = ref(0)
  const diceInUse = ref(false)
  const isLoading = ref(false)
  const isVisible = ref(false)
  const sumTilesInUse = ref(0)
  const sumTilesTaken = ref(0)
  const gamePoints = ref(0)
  const gameBonus = ref(0)
  const modeKey = ref('medium')
  const secondsLeft = ref(0)
  const hintedIds = ref([])
  /** One entry per click; each holds every tile that click claimed. */
  const history = ref([])
  /** Whether the player has opted to roll a single die this turn. */
  const singleDie = ref(false)
  /** Announcement text for screen readers. */
  const announcement = ref('')

  const mode = computed(() => modeFor(modeKey.value))
  const rows = computed(() => tiles.value.length)
  const activeDice = computed(() => dice.value.filter((d) => d.isAvailable))
  const diceSum = computed(() => sum(activeDice.value.map((d) => d.number)))
  const isFinished = computed(() => state.value === 'isOver' || state.value === 'isWin')
  const selectedTiles = computed(() =>
    tiles.value.flat().filter((t) => t.isInUse && !t.isCollateral)
  )
  const canUndo = computed(() => history.value.length > 0 && !isFinished.value)
  const remainingToMatch = computed(() => diceSum.value - sumTilesInUse.value)

  /** The classic rule: one die is allowed once nothing above a 6 is left. */
  const canRollSingleDie = computed(
    () =>
      mode.value.allowsSingleDie &&
      tiles.value.flat().some((t) => !t.isTaken) &&
      tiles.value.flat().every((t) => t.isTaken || t.index <= 6)
  )

  const eachTile = (fn) => tiles.value.forEach((row) => row.forEach(fn))
  const findTile = (rowIndex, tileId) => tiles.value[rowIndex]?.find((t) => t.id === tileId)

  const recountSums = () => {
    sumTilesInUse.value = sumTilesWhere(tiles.value, (t) => t.isInUse && !t.isCollateral)
    sumTilesTaken.value = sumTilesWhere(tiles.value, (t) => t.isTaken)
  }

  // ---------------------------------------------------------------- timer

  let ticker = null

  const stopTimer = () => {
    if (ticker !== null) clearInterval(ticker)
    ticker = null
  }

  const startTimer = () => {
    stopTimer()
    if (!mode.value.turnSeconds) return
    secondsLeft.value = mode.value.turnSeconds
    ticker = setInterval(() => {
      secondsLeft.value -= 1
      if (secondsLeft.value <= 0) {
        stopTimer()
        recountSums()
        endGame(false, 'Out of time')
      }
    }, 1000)
  }

  // ------------------------------------------------------------- lifecycle

  /** Start a new game in the given mode. */
  const newGame = (key) => {
    modeKey.value = modeFor(key).key
    tiles.value = createTiles(9, mode.value.rows)
    restart()
  }

  const restart = () => {
    stopTimer()
    eachTile((t) => {
      t.isAvailable = false
      t.isInUse = false
      t.isTaken = false
      t.isCollateral = false
      t.isExplosion = false
      t.action = ''
    })
    dice.value = newDice()
    state.value = 'isStart'
    note.value = 'Restart Game'
    numberPlay.value = 0
    diceInUse.value = false
    isLoading.value = false
    sumTilesInUse.value = 0
    sumTilesTaken.value = 0
    gamePoints.value = 0
    gameBonus.value = 0
    secondsLeft.value = mode.value.turnSeconds
    hintedIds.value = []
    history.value = []
    singleDie.value = false
    announcement.value = ''
  }

  const rollDice = () => {
    const useOne = singleDie.value && canRollSingleDie.value
    dice.value.forEach((d, i) => {
      d.isAvailable = !useOne || i === 0
      d.number = d.isAvailable ? Math.floor(Math.random() * 6) + 1 : 0
    })
    diceInUse.value = true
    numberPlay.value += 1
    hintedIds.value = []
    history.value = []
    announcement.value = `Rolled ${diceSum.value}. Select tiles that add up to ${diceSum.value}.`
  }

  /** First roll of a game: shuffle each row, then roll. */
  const startGame = () => {
    tiles.value = tiles.value.map((row) => shuffle(row))
    numberPlay.value = 0
    state.value = ''
    rollDice()
    refreshAvailability(true)
    if (!isFinished.value) startTimer()
  }

  /** Subsequent rolls: everything not yet taken comes back into play. */
  const nextTurn = () => {
    eachTile((t) => {
      if (!t.isTaken) {
        t.isAvailable = true
        t.isInUse = false
      }
    })
    state.value = ''
    rollDice()
    refreshAvailability(true)
    if (!isFinished.value) startTimer()
  }

  const endGame = (won, reason) => {
    stopTimer()
    state.value = won ? 'isWin' : 'isOver'
    note.value = won ? 'Shut The Box' : (reason ?? 'Game Over')
    diceInUse.value = false
    hintedIds.value = []
    history.value = []
    announcement.value = won
      ? `You shut the box with ${sumTilesTaken.value} points.`
      : `${note.value}. Final score ${sumTilesTaken.value}.`
    useStatsStore().record(modeKey.value, sumTilesTaken.value, won)
  }

  // ------------------------------------------------------------ turn logic

  /**
   * Recompute which tiles can still be played toward the current roll, and
   * decide whether the turn — or the game — is over.
   *
   * `advanceTurn` is false for refreshes that must not resolve the turn, such
   * as after an undo.
   */
  const refreshAvailability = (advanceTurn) => {
    eachTile((t) => {
      if (!t.isTaken && !t.isInUse) t.isAvailable = true
    })

    const remaining = diceSum.value - sumTilesInUse.value
    const playableFaces = getTilesIndexCombinations(tiles.value, remaining)
    note.value = ''

    eachTile((t) => {
      if (!t.isTaken && !t.isInUse) t.isAvailable = playableFaces.includes(t.index)
    })

    gamePoints.value = sumTilesWhere(tiles.value, (t) => t.isInUse && !t.isCollateral)
    gameBonus.value = sumTilesWhere(tiles.value, (t) => t.isInUse && t.isCollateral)

    if (!advanceTurn) return

    if (sumTilesInUse.value === diceSum.value) {
      // The roll has been matched exactly: bank every selected tile.
      eachTile((t) => {
        if (t.isInUse) {
          t.isInUse = false
          t.isTaken = true
          t.isCollateral = false
          t.isAvailable = false
        }
      })
      recountSums()
      history.value = []
      if (sumTilesTaken.value === rows.value * ROW_TOTAL) {
        endGame(true)
      } else {
        stopTimer()
        note.value = 'Roll the dice'
        state.value = 'isNext'
        diceInUse.value = false
        announcement.value = `Turn complete. Total ${sumTilesTaken.value}. Roll again.`
      }
    } else if (playableFaces.length === 0) {
      recountSums()
      endGame(sumTilesTaken.value === rows.value * ROW_TOTAL)
    }
  }

  /**
   * Every tile a click on `position` in `rowIndex` claims: the tile itself,
   * plus the run of the same face in adjacent rows, as far as it continues.
   */
  const runFrom = (rowIndex, position) => {
    const face = tiles.value[rowIndex]?.[position]?.index
    if (face === undefined) return []
    const claimed = [{ rowIndex, tile: tiles.value[rowIndex][position] }]
    if (!mode.value.allowsRuns) return claimed

    const matches = (i) => {
      const t = tiles.value[i]?.[position]
      return t && t.index === face && !t.isTaken && !t.isInUse
    }
    for (let i = rowIndex - 1; i >= 0 && matches(i); i--) {
      claimed.unshift({ rowIndex: i, tile: tiles.value[i][position] })
    }
    for (let i = rowIndex + 1; i < rows.value && matches(i); i++) {
      claimed.push({ rowIndex: i, tile: tiles.value[i][position] })
    }
    return claimed
  }

  /**
   * Try to play the tile at `position` in `rowIndex`.
   * Returns the tiles claimed, or an empty array if the move is not legal.
   */
  const playTile = (rowIndex, position) => {
    const tile = tiles.value[rowIndex]?.[position]
    if (!tile) return []

    const legal =
      tile.isAvailable &&
      !tile.isTaken &&
      !tile.isInUse &&
      sumTilesInUse.value + tile.index <= diceSum.value

    if (!legal) {
      rejectTile(rowIndex, tile.id)
      return []
    }

    const claimed = runFrom(rowIndex, position)
    claimed.forEach(({ tile: t }) => {
      t.isInUse = true
      t.isAvailable = false
      t.isCollateral = t !== tile
      t.isExplosion = true
      t.action = 'rotateIn'
    })
    history.value.push(claimed.map(({ rowIndex: r, tile: t }) => ({ rowIndex: r, id: t.id })))
    hintedIds.value = []
    sumTilesInUse.value = sumTilesWhere(tiles.value, (t) => t.isInUse && !t.isCollateral)
    announcement.value =
      remainingToMatch.value > 0
        ? `Selected ${tile.index}. ${remainingToMatch.value} left to match.`
        : `Selected ${tile.index}.`
    return claimed
  }

  /** Clear the one-shot animation flags a tile picks up when it is played. */
  const settleTile = (rowIndex, tileId) => {
    const tile = findTile(rowIndex, tileId)
    if (!tile) return
    tile.isExplosion = false
    tile.action = ''
  }

  /** Bounce a tile to show the move is not legal. */
  const rejectTile = (rowIndex, tileId) => {
    const tile = findTile(rowIndex, tileId)
    if (!tile) return
    tile.action = 'shake'
    announcement.value = 'That tile does not fit the roll.'
    setTimeout(() => {
      const current = findTile(rowIndex, tileId)
      if (current) current.action = ''
    }, 500)
  }

  /** Slide a played tile to the end of its row. */
  const compactRow = (rowIndex, tileId) => {
    if (rows.value <= 1) return
    tiles.value[rowIndex] = moveTile(tiles.value[rowIndex], tileId)
  }

  /** Take back the most recent selection of this turn. */
  const undo = () => {
    const group = history.value.pop()
    if (!group) return
    group.forEach(({ rowIndex, id }) => {
      const tile = findTile(rowIndex, id)
      if (!tile) return
      tile.isInUse = false
      tile.isCollateral = false
      tile.isExplosion = false
      tile.action = ''
    })
    sumTilesInUse.value = sumTilesWhere(tiles.value, (t) => t.isInUse && !t.isCollateral)
    refreshAvailability(false)
    announcement.value = `Undone. ${remainingToMatch.value} left to match.`
  }

  /**
   * Highlight one combination of tiles that finishes the current roll.
   * Prefers the fewest tiles, so the hint is the simplest way out.
   */
  const showHint = () => {
    const open = tiles.value
      .flatMap((row, rowIndex) => row.map((t) => ({ ...t, rowIndex })))
      .filter((t) => t.isAvailable && !t.isTaken && !t.isInUse)

    const combos = subsetsSummingTo(
      open.map((t) => t.index),
      remainingToMatch.value
    )
      .filter((c) => c.length > 0)
      .sort((a, b) => a.length - b.length)

    for (const combo of combos) {
      const pool = [...open]
      const picked = []
      for (const face of combo) {
        const at = pool.findIndex((t) => t.index === face)
        if (at === -1) break
        picked.push(pool.splice(at, 1)[0])
      }
      if (picked.length === combo.length) {
        hintedIds.value = picked.map((t) => t.id)
        announcement.value = `Hint: ${combo.join(' plus ')}.`
        return hintedIds.value
      }
    }
    announcement.value = 'No move available.'
    return []
  }

  const clearHint = () => {
    hintedIds.value = []
  }

  const toggleSingleDie = () => {
    singleDie.value = !singleDie.value
  }

  return {
    // state
    tiles, dice, state, note, numberPlay, diceInUse, isLoading, isVisible,
    sumTilesInUse, sumTilesTaken, gamePoints, gameBonus, modeKey, secondsLeft,
    hintedIds, history, singleDie, announcement,
    // getters
    mode, rows, activeDice, diceSum, isFinished, selectedTiles, canUndo,
    remainingToMatch, canRollSingleDie,
    // actions
    newGame, restart, startGame, nextTurn, refreshAvailability, playTile,
    settleTile, rejectTile, compactRow, undo, showHint, clearHint,
    toggleSingleDie, stopTimer
  }
})
