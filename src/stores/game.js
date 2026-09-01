import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { sum } from 'lodash-es'
import {
  combinationsSummingTo,
  createTiles,
  faceCounts,
  getTilesIndexCombinations,
  moveTile,
  seedSpecials,
  shuffle,
  sumTilesWhere
} from '@/services/gameServices'
import { EVENT_LIST, modeFor, runName } from './modes'
import { useStatsStore } from './stats'

/** Face value of a complete row, 1+2+…+9. */
const ROW_TOTAL = 45

const newDice = () => [
  { id: 1, number: 0, isAvailable: true },
  { id: 2, number: 0, isAvailable: true },
  { id: 3, number: 0, isAvailable: false }
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
  /** A third die, granted by the lucky-third-die event, for this turn only. */
  const extraDie = ref(false)
  /** Announcement text for screen readers. */
  const announcement = ref('')
  /** A transient moment worth calling out: a big run, a cleared row, a win. */
  const celebration = ref(null)
  /** What happened between turns, if anything. */
  const event = ref(null)
  /** Which of the available combinations the hint is pointing at. */
  const hintIndex = ref(0)

  const mode = computed(() => modeFor(modeKey.value))
  const rows = computed(() => tiles.value.length)
  const activeDice = computed(() => dice.value.filter((d) => d.isAvailable))
  const diceSum = computed(() => sum(activeDice.value.map((d) => d.number)))
  const isFinished = computed(() => state.value === 'isOver' || state.value === 'isWin')
  const selectedTiles = computed(() =>
    tiles.value.flat().filter((t) => t.isInUse && !t.isCollateral)
  )
  const canUndo = computed(() => history.value.length > 0 && !isFinished.value)

  /**
   * Every distinct combination of open tiles that finishes the roll. The count
   * is shown to the player, and the hint steps through them, so a turn reads as
   * a choice rather than a single right answer.
   */
  const waysToMatch = computed(() => {
    if (state.value !== '' || remainingToMatch.value <= 0) return []
    const open = tiles.value.map((row) =>
      row.filter((t) => t.isAvailable && !t.isTaken && !t.isInUse && t.kind === 'normal')
    )
    return combinationsSummingTo(faceCounts(open), remainingToMatch.value)
  })

  /**
   * How many tiles each playable tile would claim, for every tile whose run is
   * longer than one. The collapsing-column rule was invisible until after the
   * click, so a player had no way to spot the big moves.
   */
  const runSizes = computed(() => {
    const sizes = {}
    if (!mode.value.allowsRuns || state.value !== '') return sizes
    tiles.value.forEach((row, rowIndex) =>
      row.forEach((tile, position) => {
        if (!tile.isAvailable || tile.isTaken || tile.isInUse) return
        if (sumTilesInUse.value + tile.index > diceSum.value) return
        const size = runFrom(rowIndex, position).length
        if (size > 1) sizes[tile.id] = size
      })
    )
    return sizes
  })

  /** The largest run currently on offer, so the board can call it out. */
  const bestRun = computed(() => Math.max(0, ...Object.values(runSizes.value)))

  /** Tiles a click would claim, previewed on hover or focus. */
  const previewIds = ref([])
  const previewRun = (rowIndex, position) => {
    if (state.value !== '') return
    const tile = tiles.value[rowIndex]?.[position]
    if (!tile?.isAvailable || sumTilesInUse.value + tile.index > diceSum.value) {
      previewIds.value = []
      return
    }
    const run = runFrom(rowIndex, position)
    previewIds.value = run.length > 1 ? run.map(({ tile: t }) => t.id) : []
  }
  const clearPreview = () => {
    previewIds.value = []
  }
  const remainingToMatch = computed(() => diceSum.value - sumTilesInUse.value)

  /** Face value of everything still open. */
  const openTotal = computed(() =>
    sumTilesWhere(tiles.value, (t) => !t.isTaken)
  )

  /**
   * Once the whole board is worth 6 or less, two dice can roll higher than
   * anything left and end the game on nothing but bad luck, so the second die
   * is dropped automatically rather than offered.
   */
  const mustRollSingleDie = computed(() => openTotal.value > 0 && openTotal.value <= 6)

  /** The classic rule: one die may be chosen once nothing above a 6 is left. */
  const canRollSingleDie = computed(
    () =>
      !mustRollSingleDie.value &&
      mode.value.allowsSingleDie &&
      tiles.value.flat().some((t) => !t.isTaken) &&
      tiles.value.flat().every((t) => t.isTaken || t.index <= 6)
  )

  const eachTile = (fn) => tiles.value.forEach((row) => row.forEach(fn))

  /**
   * Every tile a click on `position` in `rowIndex` claims: the tile itself,
   * plus the run of the same face in adjacent rows, as far as it continues.
   */
  const runFrom = (rowIndex, position) => {
    const face = tiles.value[rowIndex]?.[position]?.index
    if (face === undefined) return []
    const origin = tiles.value[rowIndex][position]
    const claimed = [{ rowIndex, tile: origin }]
    // A special tile is a move of its own; it never drags a column along.
    if (!mode.value.allowsRuns || origin.kind !== 'normal') return claimed

    const matches = (i) => {
      const t = tiles.value[i]?.[position]
      return t && t.index === face && t.kind === 'normal' && !t.isTaken && !t.isInUse
    }
    for (let i = rowIndex - 1; i >= 0 && matches(i); i--) {
      claimed.unshift({ rowIndex: i, tile: tiles.value[i][position] })
    }
    for (let i = rowIndex + 1; i < rows.value && matches(i); i++) {
      claimed.push({ rowIndex: i, tile: tiles.value[i][position] })
    }
    return claimed
  }
  const findTile = (rowIndex, tileId) => tiles.value[rowIndex]?.find((t) => t.id === tileId)

  /** What a tile is worth toward the current roll. Scoring always uses index. */
  const valueOf = (t) => (t.kind === 'wild' && t.wildValue != null ? t.wildValue : t.index)

  const inUseTotal = () =>
    tiles.value
      .flat()
      .filter((t) => t.isInUse && !t.isCollateral)
      .reduce((sum, t) => sum + valueOf(t), 0)

  const recountSums = () => {
    sumTilesInUse.value = inUseTotal()
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
    const board = createTiles(9, mode.value.rows)
    if (mode.value.hasSurprises) seedSpecials(board, { wild: 2, locked: 2 })
    tiles.value = board
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
      t.wildValue = null
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
    previewIds.value = []
    singleDie.value = false
    announcement.value = ''
  }

  const rollDice = () => {
    const useOne = mustRollSingleDie.value || (singleDie.value && canRollSingleDie.value)
    const count = useOne ? 1 : extraDie.value ? 3 : 2
    dice.value.forEach((d, i) => {
      d.isAvailable = i < count
      d.number = d.isAvailable ? Math.floor(Math.random() * 6) + 1 : 0
    })
    diceInUse.value = true
    numberPlay.value += 1
    hintedIds.value = []
    history.value = []
    previewIds.value = []
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

  /**
   * Roughly one turn in six brings something with it. Only the nine-row modes
   * get these; Beginner stays the classic game.
   */
  const maybeEvent = () => {
    event.value = null
    extraDie.value = false
    if (!mode.value.hasSurprises || Math.random() > 0.17) return

    const open = tiles.value.flat().filter((t) => !t.isTaken && t.kind === 'normal')
    const choices = EVENT_LIST.filter(
      (e) => e.key !== 'wildDrop' || open.length > 0
    ).filter((e) => e.key !== 'thirdDie' || !mustRollSingleDie.value)
    if (choices.length === 0) return

    const chosen = choices[Math.floor(Math.random() * choices.length)]
    event.value = chosen

    if (chosen.key === 'thirdDie') {
      extraDie.value = true
    } else if (chosen.key === 'reshuffle') {
      tiles.value = tiles.value.map((row) => shuffle(row))
    } else if (chosen.key === 'wildDrop') {
      open[Math.floor(Math.random() * open.length)].kind = 'wild'
    }
    celebrate(chosen.title, chosen.detail, 'event')
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
    maybeEvent()
    rollDice()
    refreshAvailability(true)
    if (!isFinished.value) startTimer()
  }

  let celebrationTimer = null
  const celebrate = (title, detail, tone = 'good') => {
    if (!title) return
    celebration.value = { id: Date.now() + Math.random(), title, detail, tone }
    clearTimeout(celebrationTimer)
    celebrationTimer = setTimeout(() => (celebration.value = null), 1600)
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
    // Special tiles do not follow the ordinary subset-sum, so they are held out
    // of the search and given their own rule afterwards.
    const ordinary = tiles.value.map((row) => row.filter((t) => t.kind === 'normal'))
    const playableFaces = getTilesIndexCombinations(ordinary, remaining)
    note.value = ''

    let specialPlayable = false
    eachTile((t) => {
      if (t.isTaken || t.isInUse) return
      if (t.kind === 'wild') {
        // Takes whatever is still needed, up to a single tile's worth.
        t.isAvailable = remaining >= 1
      } else if (t.kind === 'locked') {
        // Only ever plays on its own, matching the entire roll.
        t.isAvailable = sumTilesInUse.value === 0 && t.index === diceSum.value
      } else {
        t.isAvailable = playableFaces.includes(t.index)
        return
      }
      if (t.isAvailable) specialPlayable = true
    })

    gamePoints.value = inUseTotal()
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
      gamePoints.value = 0
      gameBonus.value = 0
      if (sumTilesTaken.value === rows.value * ROW_TOTAL) {
        endGame(true)
      } else {
        stopTimer()
        note.value = 'Roll the dice'
        state.value = 'isNext'
        diceInUse.value = false
        announcement.value = `Turn complete. Total ${sumTilesTaken.value}. Roll again.`
      }
    } else if (playableFaces.length === 0 && !specialPlayable) {
      recountSums()
      endGame(sumTilesTaken.value === rows.value * ROW_TOTAL)
    }
  }

  /**
   * Try to play the tile at `position` in `rowIndex`.
   * Returns the tiles claimed, or an empty array if the move is not legal.
   */
  const playTile = (rowIndex, position) => {
    const tile = tiles.value[rowIndex]?.[position]
    if (!tile) return []

    const worth = tile.kind === 'wild' ? Math.min(remainingToMatch.value, 9) : tile.index
    const legal =
      tile.isAvailable &&
      !tile.isTaken &&
      !tile.isInUse &&
      sumTilesInUse.value + worth <= diceSum.value

    if (!legal) {
      rejectTile(rowIndex, tile.id)
      return []
    }

    if (tile.kind === 'wild') tile.wildValue = worth
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
    previewIds.value = []
    hintIndex.value = 0

    if (claimed.length > 1) {
      celebrate(runName(claimed.length), `${claimed.length} tiles in one move`)
    } else if (tile.kind === 'wild') {
      celebrate('Wild!', `Counted as ${worth}`)
    } else if (tile.kind === 'locked') {
      celebrate('Unlocked!', `Matched the whole roll with one tile`)
    }
    sumTilesInUse.value = inUseTotal()
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
      tile.wildValue = null
      tile.action = ''
    })
    sumTilesInUse.value = inUseTotal()
    refreshAvailability(false)
    announcement.value = `Undone. ${remainingToMatch.value} left to match.`
  }

  /**
   * Highlight one combination of tiles that finishes the current roll.
   * Prefers the fewest tiles, so the hint is the simplest way out.
   */
  /**
   * Point at one combination that finishes the roll. Repeated calls step
   * through the alternatives rather than always showing the same one.
   */
  const showHint = () => {
    const open = tiles.value
      .flatMap((row, rowIndex) => row.map((t) => ({ ...t, rowIndex })))
      .filter((t) => t.isAvailable && !t.isTaken && !t.isInUse)

    const ways = waysToMatch.value
    const combos = ways.length
      ? [...ways.slice(hintIndex.value % ways.length), ...ways.slice(0, hintIndex.value % ways.length)]
      : []
    hintIndex.value += 1

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
    hintedIds, history, singleDie, announcement, previewIds, celebration, event,
    // getters
    mode, rows, activeDice, diceSum, isFinished, selectedTiles, canUndo,
    remainingToMatch, canRollSingleDie, mustRollSingleDie, openTotal, runSizes, bestRun,
    waysToMatch,
    // actions
    newGame, restart, startGame, nextTurn, refreshAvailability, playTile,
    settleTile, rejectTile, compactRow, undo, showHint, clearHint,
    toggleSingleDie, stopTimer, runFrom, previewRun, clearPreview, celebrate
  }
})
