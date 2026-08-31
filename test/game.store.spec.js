import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useGameStore } from '../src/stores/game.js'
import { useScoresStore } from '../src/stores/scores.js'
import { subsetsSummingTo } from '../src/services/gameServices.js'

/** Feed the dice a fixed sequence so a failing game can be replayed. */
const stubDice = (rolls) => {
  let i = 0
  vi.spyOn(Math, 'random').mockImplementation(() => {
    const face = rolls[i++ % rolls.length]
    return (face - 1) / 6 + 0.001
  })
}

/**
 * Play one legal move if there is one: take the first set of available tiles
 * that exactly finishes the current roll.
 */
const playATurn = (game) => {
  const remaining = game.diceSum - game.sumTilesInUse
  const available = game.tiles
    .flatMap((row, rowIndex) => row.map((t) => ({ ...t, rowIndex })))
    .filter((t) => t.isAvailable && !t.isTaken && !t.isInUse)

  for (const combo of subsetsSummingTo(available.map((t) => t.index), remaining)) {
    if (combo.length === 0) continue
    const picked = []
    const pool = [...available]
    for (const face of combo) {
      const at = pool.findIndex((t) => t.index === face)
      if (at === -1) break
      picked.push(pool.splice(at, 1)[0])
    }
    if (picked.length !== combo.length) continue
    picked.forEach((t) => game.useTile(t.rowIndex, t.id, false))
    game.refreshAvailability(true)
    return true
  }
  return false
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('new game', () => {
  it('deals the requested board and waits for the first roll', () => {
    const game = useGameStore()
    game.newGame(9)
    expect(game.rows).toBe(9)
    expect(game.state).toBe('isStart')
    expect(game.numberPlay).toBe(0)
    expect(game.sumTilesTaken).toBe(0)
    expect(game.tiles.flat().every((t) => !t.isTaken && !t.isInUse)).toBe(true)
  })

  it('rolls two dice and opens the board on start', () => {
    const game = useGameStore()
    game.newGame(1)
    game.startGame()
    expect(game.state).toBe('')
    expect(game.diceInUse).toBe(true)
    expect(game.numberPlay).toBe(1)
    expect(game.diceSum).toBeGreaterThanOrEqual(2)
    expect(game.diceSum).toBeLessThanOrEqual(12)
    expect(game.tiles.flat().some((t) => t.isAvailable)).toBe(true)
  })
})

describe('taking a turn', () => {
  it('banks the selected tiles and asks for another roll once the roll is matched', () => {
    stubDice([3, 4]) // every roll is 7
    const game = useGameStore()
    game.newGame(1)
    game.startGame()

    const three = game.tiles[0].find((t) => t.index === 3)
    const four = game.tiles[0].find((t) => t.index === 4)
    game.useTile(0, three.id, false)
    game.useTile(0, four.id, false)
    expect(game.sumTilesInUse).toBe(7)

    game.refreshAvailability(true)
    expect(game.state).toBe('isNext')
    expect(game.sumTilesTaken).toBe(7)
    expect(game.tiles[0].filter((t) => t.isTaken).map((t) => t.index).sort()).toEqual([3, 4])
    expect(game.diceInUse).toBe(false)
  })

  it('leaves the turn open while the roll is only partly matched', () => {
    stubDice([3, 4])
    const game = useGameStore()
    game.newGame(1)
    game.startGame()

    game.useTile(0, game.tiles[0].find((t) => t.index === 3).id, false)
    game.refreshAvailability(true)
    expect(game.state).toBe('')
    expect(game.sumTilesTaken).toBe(0)
    expect(game.gamePoints).toBe(3)
  })

  it('scores tiles matched in other rows as bonus, not toward the roll', () => {
    stubDice([3, 4])
    const game = useGameStore()
    game.newGame(3)
    game.startGame()

    game.useTile(0, game.tiles[0].find((t) => t.index === 7).id, false)
    game.useTile(1, game.tiles[1].find((t) => t.index === 7).id, true)

    expect(game.sumTilesInUse).toBe(7) // the bonus tile does not count toward the roll
    game.refreshAvailability(true)
    // The bonus is tallied for the turn just played, then both tiles are banked.
    expect(game.gameBonus).toBe(7)
    expect(game.sumTilesTaken).toBe(14)
    expect(game.state).toBe('isNext')
  })
})

describe('ending a game', () => {
  it('declares game over when the roll cannot be matched', () => {
    stubDice([1, 1]) // every roll is 2
    const game = useGameStore()
    game.newGame(1)
    game.startGame()
    // Take everything that could ever make 2.
    game.tiles[0].forEach((t) => {
      if (t.index === 1 || t.index === 2) t.isTaken = true
    })
    game.refreshAvailability(true)
    expect(game.state).toBe('isOver')
    expect(game.note).toBe('Game Over')
  })

  it('declares a win when every tile is taken', () => {
    stubDice([3, 4])
    const game = useGameStore()
    game.newGame(1)
    game.startGame()
    game.tiles[0].forEach((t) => {
      if (t.index !== 7) t.isTaken = true
    })
    game.useTile(0, game.tiles[0].find((t) => t.index === 7).id, false)
    game.refreshAvailability(true)
    expect(game.state).toBe('isWin')
    expect(game.sumTilesTaken).toBe(45)
  })

  it('records the score as a personal best', () => {
    stubDice([3, 4])
    const game = useGameStore()
    const scores = useScoresStore()
    game.newGame(1)
    game.startGame()
    game.tiles[0].forEach((t) => {
      if (t.index !== 7) t.isTaken = true
    })
    game.useTile(0, game.tiles[0].find((t) => t.index === 7).id, false)
    game.refreshAvailability(true)
    expect(scores.bestFor(1)).toBe(45)
    expect(JSON.parse(localStorage.getItem('shutTheCube.bestScores'))).toEqual({ 1: 45 })
  })
})

describe('playing whole games', () => {
  it.each([1, 3, 9])('reaches a terminal state on a %i-row board', (rows) => {
    const game = useGameStore()
    game.newGame(rows)
    game.startGame()

    for (let guard = 0; guard < 500 && !game.isFinished; guard++) {
      if (game.state === 'isNext') {
        game.nextTurn()
      } else if (!playATurn(game)) {
        // No legal move: the board should have already ended the game.
        break
      }
    }

    expect(game.isFinished, `state was "${game.state}"`).toBe(true)
    expect(game.sumTilesTaken).toBeLessThanOrEqual(rows * 45)
    expect(game.state === 'isWin').toBe(game.sumTilesTaken === rows * 45)
    // Nothing may be left half-selected once the game is over.
    expect(game.tiles.flat().every((t) => !t.isInUse)).toBe(true)
  })

  it('never leaves a tile both taken and in use', () => {
    const game = useGameStore()
    game.newGame(9)
    game.startGame()
    for (let guard = 0; guard < 500 && !game.isFinished; guard++) {
      if (game.state === 'isNext') game.nextTurn()
      else if (!playATurn(game)) break
      expect(game.tiles.flat().every((t) => !(t.isTaken && t.isInUse))).toBe(true)
    }
  })
})

describe('restart', () => {
  it('clears the board and the score back to the opening state', () => {
    const game = useGameStore()
    game.newGame(2)
    game.startGame()
    game.useTile(0, game.tiles[0][0].id, false)
    game.refreshAvailability(true)

    game.restart()
    expect(game.state).toBe('isStart')
    expect(game.numberPlay).toBe(0)
    expect(game.sumTilesTaken).toBe(0)
    expect(game.sumTilesInUse).toBe(0)
    expect(game.gamePoints).toBe(0)
    expect(game.diceSum).toBe(0)
    expect(game.tiles.flat().every((t) => !t.isTaken && !t.isInUse)).toBe(true)
    expect(game.rows).toBe(2) // same board size
  })
})
