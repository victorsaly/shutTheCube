import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useGameStore } from '../src/stores/game.js'
import { useStatsStore } from '../src/stores/stats.js'
import { MODES } from '../src/stores/modes.js'
import { subsetsSummingTo } from '../src/services/gameServices.js'

/** Feed the dice a fixed sequence so a failing game can be replayed. */
const stubDice = (rolls) => {
  let i = 0
  vi.spyOn(Math, 'random').mockImplementation(() => {
    const face = rolls[i++ % rolls.length]
    return (face - 1) / 6 + 0.001
  })
}

const positionOf = (game, rowIndex, face) =>
  game.tiles[rowIndex].findIndex((t) => t.index === face)

/** Play one legal move if there is one. */
const playATurn = (game) => {
  const open = game.tiles
    .flatMap((row, rowIndex) => row.map((t, position) => ({ ...t, rowIndex, position })))
    .filter((t) => t.isAvailable && !t.isTaken && !t.isInUse)

  for (const combo of subsetsSummingTo(open.map((t) => t.index), game.remainingToMatch)) {
    if (combo.length === 0) continue
    const pool = [...open]
    const picked = []
    for (const face of combo) {
      const at = pool.findIndex((t) => t.index === face)
      if (at === -1) break
      picked.push(pool.splice(at, 1)[0])
    }
    if (picked.length !== combo.length) continue
    picked.forEach((t) => {
      const position = game.tiles[t.rowIndex].findIndex((x) => x.id === t.id)
      if (position >= 0) game.playTile(t.rowIndex, position)
    })
    game.refreshAvailability(true)
    return true
  }
  return false
}

let game

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  vi.restoreAllMocks()
  game = useGameStore()
})

afterEach(() => {
  game.stopTimer()
})

describe('modes', () => {
  it('deals the board each mode calls for', () => {
    game.newGame('beginner')
    expect(game.rows).toBe(1)
    game.newGame('medium')
    expect(game.rows).toBe(9)
    game.newGame('ninja')
    expect(game.rows).toBe(9)
  })

  it('gives Medium and Ninja different rules', () => {
    // In the 2018 build these two were byte-identical.
    expect(MODES.medium).not.toEqual(MODES.ninja)
    expect(MODES.medium.turnSeconds).toBe(0)
    expect(MODES.ninja.turnSeconds).toBeGreaterThan(0)
  })

  it('falls back to Medium for an unknown mode', () => {
    game.newGame('nonsense')
    expect(game.modeKey).toBe('medium')
  })

  it('waits for the first roll', () => {
    game.newGame('medium')
    expect(game.state).toBe('isStart')
    expect(game.numberPlay).toBe(0)
    expect(game.tiles.flat().every((t) => !t.isTaken && !t.isInUse)).toBe(true)
  })
})

describe('rolling', () => {
  it('rolls two dice and opens the board', () => {
    game.newGame('beginner')
    game.startGame()
    expect(game.state).toBe('')
    expect(game.diceInUse).toBe(true)
    expect(game.numberPlay).toBe(1)
    expect(game.diceSum).toBeGreaterThanOrEqual(2)
    expect(game.diceSum).toBeLessThanOrEqual(12)
    expect(game.tiles.flat().some((t) => t.isAvailable)).toBe(true)
  })

  it('offers a single die only once nothing above a 6 is left', () => {
    game.newGame('beginner')
    game.startGame()
    expect(game.canRollSingleDie).toBe(false)

    game.tiles[0].forEach((t) => {
      if (t.index > 6) t.isTaken = true
    })
    expect(game.canRollSingleDie).toBe(true)
  })

  it('never offers a single die in a mode that does not allow it', () => {
    game.newGame('medium')
    game.startGame()
    game.tiles.forEach((row) => row.forEach((t) => (t.isTaken = t.index > 6)))
    expect(game.canRollSingleDie).toBe(false)
  })

  it('rolls one die when the player opts in', () => {
    stubDice([5])
    game.newGame('beginner')
    game.startGame()
    game.tiles[0].forEach((t) => {
      if (t.index > 6) t.isTaken = true
    })
    game.toggleSingleDie()
    game.nextTurn()

    expect(game.activeDice).toHaveLength(1)
    expect(game.diceSum).toBe(5)
    expect(game.dice[1].isAvailable).toBe(false)
  })
})

describe('taking a turn', () => {
  beforeEach(() => stubDice([3, 4])) // every roll is 7

  it('banks the selected tiles once the roll is matched exactly', () => {
    game.newGame('beginner')
    game.startGame()

    game.playTile(0, positionOf(game, 0, 3))
    game.playTile(0, positionOf(game, 0, 4))
    expect(game.sumTilesInUse).toBe(7)

    game.refreshAvailability(true)
    expect(game.state).toBe('isNext')
    expect(game.sumTilesTaken).toBe(7)
    expect(game.diceInUse).toBe(false)
  })

  it('leaves the turn open while the roll is only partly matched', () => {
    game.newGame('beginner')
    game.startGame()
    game.playTile(0, positionOf(game, 0, 3))
    game.refreshAvailability(true)
    expect(game.state).toBe('')
    expect(game.remainingToMatch).toBe(4)
    expect(game.gamePoints).toBe(3)
  })

  it('refuses a tile that would overshoot the roll', () => {
    game.newGame('beginner')
    game.startGame()
    const position = positionOf(game, 0, 9)
    expect(game.playTile(0, position)).toEqual([])
    expect(game.tiles[0][position].isInUse).toBe(false)
    expect(game.sumTilesInUse).toBe(0)
  })

  it('claims a matching run in adjacent rows as bonus', () => {
    game.newGame('medium')
    game.startGame()
    // Line a 7 up at position 0 in the first three rows only.
    game.tiles.slice(0, 3).forEach((row) => {
      const at = row.findIndex((t) => t.index === 7)
      row.splice(0, 0, row.splice(at, 1)[0])
    })
    const at3 = game.tiles[3].findIndex((t) => t.index === 2)
    game.tiles[3].splice(0, 0, game.tiles[3].splice(at3, 1)[0])
    game.refreshAvailability(false)

    const claimed = game.playTile(1, 0)
    expect(claimed).toHaveLength(3)
    expect(game.tiles.slice(0, 3).map((r) => r[0].isCollateral)).toEqual([true, false, true])
    expect(game.tiles[3][0].isInUse).toBe(false)
    // Only the clicked tile counts toward the roll.
    expect(game.sumTilesInUse).toBe(7)
  })

  it('never claims a run in a mode without them', () => {
    game.newGame('beginner')
    game.startGame()
    expect(game.playTile(0, positionOf(game, 0, 7))).toHaveLength(1)
  })
})

describe('undo', () => {
  beforeEach(() => stubDice([3, 4]))

  it('is unavailable until something is selected', () => {
    game.newGame('beginner')
    game.startGame()
    expect(game.canUndo).toBe(false)
  })

  it('takes back the last selection and restores the sum', () => {
    game.newGame('beginner')
    game.startGame()
    game.playTile(0, positionOf(game, 0, 3))
    expect(game.canUndo).toBe(true)
    expect(game.sumTilesInUse).toBe(3)

    game.undo()
    expect(game.sumTilesInUse).toBe(0)
    expect(game.remainingToMatch).toBe(7)
    expect(game.canUndo).toBe(false)
    expect(game.tiles[0].every((t) => !t.isInUse)).toBe(true)
  })

  it('takes back a whole run in one step', () => {
    game.newGame('medium')
    game.startGame()
    game.tiles.forEach((row) => {
      const at = row.findIndex((t) => t.index === 7)
      row.splice(0, 0, row.splice(at, 1)[0])
    })
    game.refreshAvailability(false)
    game.playTile(0, 0)
    expect(game.tiles.every((r) => r[0].isInUse)).toBe(true)

    game.undo()
    expect(game.tiles.every((r) => !r[0].isInUse)).toBe(true)
    expect(game.sumTilesInUse).toBe(0)
  })

  it('cannot reach back into a turn that has already been banked', () => {
    game.newGame('beginner')
    game.startGame()
    game.playTile(0, positionOf(game, 0, 3))
    game.playTile(0, positionOf(game, 0, 4))
    game.refreshAvailability(true)
    expect(game.canUndo).toBe(false)
    expect(game.sumTilesTaken).toBe(7)
  })
})

describe('hints', () => {
  beforeEach(() => stubDice([3, 4]))

  it('highlights tiles that finish the roll', () => {
    game.newGame('beginner')
    game.startGame()
    const hinted = game.showHint()
    expect(hinted.length).toBeGreaterThan(0)

    const faces = hinted.map((id) => game.tiles.flat().find((t) => t.id === id).index)
    expect(faces.reduce((a, b) => a + b, 0)).toBe(7)
  })

  it('accounts for what is already selected', () => {
    game.newGame('beginner')
    game.startGame()
    game.playTile(0, positionOf(game, 0, 3))
    const faces = game
      .showHint()
      .map((id) => game.tiles.flat().find((t) => t.id === id).index)
    expect(faces.reduce((a, b) => a + b, 0)).toBe(4)
  })

  it('prefers the shortest combination', () => {
    game.newGame('beginner')
    game.startGame()
    expect(game.showHint()).toHaveLength(1) // a single 7 beats 3+4
  })

  it('clears when the next tile is played', () => {
    game.newGame('beginner')
    game.startGame()
    game.showHint()
    expect(game.hintedIds.length).toBeGreaterThan(0)
    game.playTile(0, positionOf(game, 0, 3))
    expect(game.hintedIds).toEqual([])
  })
})

describe('the Ninja turn timer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    stubDice([3, 4])
  })
  afterEach(() => vi.useRealTimers())

  it('counts down once the dice are rolled', () => {
    game.newGame('ninja')
    game.startGame()
    expect(game.secondsLeft).toBe(30)
    vi.advanceTimersByTime(3000)
    expect(game.secondsLeft).toBe(27)
  })

  it('ends the game when it runs out', () => {
    game.newGame('ninja')
    game.startGame()
    vi.advanceTimersByTime(30_000)
    expect(game.state).toBe('isOver')
    expect(game.note).toBe('Out of time')
  })

  it('does not run in the untimed modes', () => {
    game.newGame('medium')
    game.startGame()
    vi.advanceTimersByTime(60_000)
    expect(game.state).toBe('')
  })

  it('stops once the turn is banked', () => {
    game.newGame('ninja')
    game.startGame()
    game.playTile(0, positionOf(game, 0, 3))
    game.playTile(0, positionOf(game, 0, 4))
    game.refreshAvailability(true)
    expect(game.state).toBe('isNext')
    vi.advanceTimersByTime(60_000)
    expect(game.state).toBe('isNext') // the clock is not still running
  })
})

describe('ending a game', () => {
  it('declares game over when the roll cannot be matched', () => {
    stubDice([1, 1])
    game.newGame('beginner')
    game.startGame()
    game.tiles[0].forEach((t) => {
      if (t.index === 1 || t.index === 2) t.isTaken = true
    })
    game.refreshAvailability(true)
    expect(game.state).toBe('isOver')
  })

  it('declares a win when every tile is taken', () => {
    stubDice([3, 4])
    game.newGame('beginner')
    game.startGame()
    game.tiles[0].forEach((t) => {
      if (t.index !== 7) t.isTaken = true
    })
    game.playTile(0, positionOf(game, 0, 7))
    game.refreshAvailability(true)
    expect(game.state).toBe('isWin')
    expect(game.sumTilesTaken).toBe(45)
  })

  it('records the result against the mode that was played', () => {
    stubDice([1, 1]) // every roll is 2
    const stats = useStatsStore()
    game.newGame('ninja')
    game.startGame()
    // Nothing that could ever make 2 is left, so the next check ends the game.
    game.tiles.forEach((row) =>
      row.forEach((t) => {
        if (t.index <= 2) t.isTaken = true
      })
    )
    game.refreshAvailability(true)

    expect(game.state).toBe('isOver')
    expect(stats.forMode('ninja').played).toBe(1)
    expect(stats.forMode('ninja').wins).toBe(0)
    expect(stats.forMode('medium').played).toBe(0)
  })
})

describe('playing whole games', () => {
  it.each(['beginner', 'medium', 'ninja'])('reaches a terminal state in %s', (key) => {
    vi.useFakeTimers()
    game.newGame(key)
    game.startGame()

    for (let guard = 0; guard < 500 && !game.isFinished; guard++) {
      if (game.state === 'isNext') game.nextTurn()
      else if (!playATurn(game)) break
    }

    expect(game.isFinished, `state was "${game.state}"`).toBe(true)
    expect(game.sumTilesTaken).toBeLessThanOrEqual(game.rows * 45)
    expect(game.state === 'isWin').toBe(game.sumTilesTaken === game.rows * 45)
    expect(game.tiles.flat().every((t) => !t.isInUse)).toBe(true)
    vi.useRealTimers()
  })
})

describe('restart', () => {
  it('clears the board back to the opening state, keeping the mode', () => {
    stubDice([3, 4])
    game.newGame('ninja')
    game.startGame()
    game.playTile(0, 0)

    game.restart()
    expect(game.state).toBe('isStart')
    expect(game.modeKey).toBe('ninja')
    expect(game.rows).toBe(9)
    expect(game.numberPlay).toBe(0)
    expect(game.sumTilesTaken).toBe(0)
    expect(game.sumTilesInUse).toBe(0)
    expect(game.diceSum).toBe(0)
    expect(game.canUndo).toBe(false)
    expect(game.tiles.flat().every((t) => !t.isTaken && !t.isInUse)).toBe(true)
  })
})
