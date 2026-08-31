import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { sum } from 'lodash-es'
import {
  createTiles,
  getTilesIndexCombinations,
  moveTile,
  shuffle,
  sumTilesWhere
} from '@/services/gameServices'
import { useScoresStore } from './scores'

/** Face value of a complete row, 1+2+…+9. */
const ROW_TOTAL = 45

const newDice = () => [
  { id: 1, number: 0 },
  { id: 2, number: 0 }
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

  const rows = computed(() => tiles.value.length)
  const diceSum = computed(() => sum(dice.value.map((d) => d.number)))
  const isFinished = computed(() => state.value === 'isOver' || state.value === 'isWin')
  const selectedTiles = computed(() =>
    tiles.value.flat().filter((t) => t.isInUse && !t.isCollateral)
  )

  const eachTile = (fn) => tiles.value.forEach((row) => row.forEach(fn))

  const recountSums = () => {
    sumTilesInUse.value = sumTilesWhere(tiles.value, (t) => t.isInUse && !t.isCollateral)
    sumTilesTaken.value = sumTilesWhere(tiles.value, (t) => t.isTaken)
  }

  /** Start a new board. `boardRows` is 1 for Shut The Box, 9 for Shut The Cube. */
  const newGame = (boardRows) => {
    tiles.value = createTiles(9, boardRows)
    restart()
  }

  const restart = () => {
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
  }

  const rollDice = () => {
    dice.value.forEach((d) => {
      d.number = Math.floor(Math.random() * 6) + 1
    })
    diceInUse.value = true
    numberPlay.value += 1
  }

  /** First roll of a game: shuffle each row, then roll. */
  const startGame = () => {
    tiles.value = tiles.value.map((row) => shuffle(row))
    numberPlay.value = 0
    state.value = ''
    rollDice()
    refreshAvailability(true)
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
  }

  const endGame = (won) => {
    state.value = won ? 'isWin' : 'isOver'
    note.value = won ? 'Shut The Box' : 'Game Over'
    diceInUse.value = false
    useScoresStore().record(rows.value, sumTilesTaken.value)
  }

  /**
   * Recompute which tiles can still be played toward the current roll, and
   * decide whether the turn — or the game — is over.
   *
   * `advanceTurn` is false for the knock-on updates caused by tiles that were
   * matched in other rows, so the turn is only resolved once.
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
        }
      })
      recountSums()
      if (sumTilesTaken.value === rows.value * ROW_TOTAL) {
        endGame(true)
      } else {
        note.value = 'Roll the dice'
        state.value = 'isNext'
        diceInUse.value = false
      }
    } else if (playableFaces.length === 0) {
      recountSums()
      endGame(sumTilesTaken.value === rows.value * ROW_TOTAL)
    }
  }

  /** Mark a tile as selected. `collateral` tiles are matches in other rows. */
  const useTile = (rowIndex, tileId, collateral) => {
    const tile = tiles.value[rowIndex]?.find((t) => t.id === tileId)
    if (!tile) return
    tile.isInUse = true
    tile.isCollateral = collateral
    tile.isExplosion = true
    tile.action = 'rotateIn'
    sumTilesInUse.value = sumTilesWhere(tiles.value, (t) => t.isInUse && !t.isCollateral)
  }

  /** Clear the one-shot animation flags a tile picks up when it is played. */
  const settleTile = (rowIndex, tileId) => {
    const tile = tiles.value[rowIndex]?.find((t) => t.id === tileId)
    if (!tile) return
    tile.isExplosion = false
    tile.action = ''
  }

  /** Bounce a tile to show the move is not legal. */
  const rejectTile = (rowIndex, tileId, collateral) => {
    const tile = tiles.value[rowIndex]?.find((t) => t.id === tileId)
    if (!tile) return
    tile.action = 'shake'
    tile.isCollateral = collateral
    setTimeout(() => {
      const current = tiles.value[rowIndex]?.find((t) => t.id === tileId)
      if (current) current.action = ''
    }, 500)
  }

  /** Slide a played tile to the end of its row. */
  const compactRow = (rowIndex, tileId) => {
    if (rows.value <= 1) return
    tiles.value[rowIndex] = moveTile(tiles.value[rowIndex], tileId)
  }

  return {
    // state
    tiles, dice, state, note, numberPlay, diceInUse, isLoading, isVisible,
    sumTilesInUse, sumTilesTaken, gamePoints, gameBonus,
    // getters
    rows, diceSum, isFinished, selectedTiles,
    // actions
    newGame, restart, startGame, nextTurn, refreshAvailability,
    useTile, settleTile, rejectTile, compactRow
  }
})
