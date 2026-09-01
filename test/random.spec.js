import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import {
  DAILY_EPOCH,
  dailySeed,
  dayNumber,
  mulberry32,
  secondsUntilTomorrow,
  seedFrom,
  shiftStamp,
  streakOf,
  todayStamp
} from '@/services/random'
import { createTiles, seedSpecials, shuffle } from '@/services/gameServices'
import { useGameStore } from '@/stores/game'
import { challengeUrl, scoreCard } from '@/services/share'

describe('mulberry32', () => {
  it('gives the same stream for the same seed', () => {
    const a = mulberry32(12345)
    const b = mulberry32(12345)
    const runA = Array.from({ length: 20 }, () => a())
    const runB = Array.from({ length: 20 }, () => b())
    expect(runA).toEqual(runB)
  })

  it('gives different streams for different seeds', () => {
    const a = Array.from({ length: 20 }, mulberry32(1))
    const b = Array.from({ length: 20 }, mulberry32(2))
    expect(a).not.toEqual(b)
  })

  /*
   * The leaderboard Worker rebuilds the board a seed dealt, to check a
   * submitted score against the game that was actually played. If these two
   * copies of the generator ever drift apart nothing shouts — every honest
   * score is quietly rejected as a forgery. The same three numbers are pinned
   * in arcade-api's `test/parity.test.js`, so a change has to break both.
   */
  it('produces the pinned stream the leaderboard also expects', () => {
    const rng = mulberry32(12345)
    expect([rng(), rng(), rng()].map((n) => Number(n.toFixed(10)))).toEqual([
      0.9797282678, 0.3067522645, 0.4842054215
    ])
  })

  it('stays inside [0, 1)', () => {
    const rng = mulberry32(99)
    for (let i = 0; i < 500; i += 1) {
      const value = rng()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })
})

describe('seedFrom', () => {
  it('is stable for the same text', () => {
    expect(seedFrom('shutthecube:2026-09-01:medium')).toBe(
      seedFrom('shutthecube:2026-09-01:medium')
    )
  })

  it('separates modes on the same day', () => {
    const day = '2026-09-01'
    const seeds = new Set([
      dailySeed('beginner', day),
      dailySeed('medium', day),
      dailySeed('ninja', day)
    ])
    expect(seeds.size).toBe(3)
  })

  it('separates days for the same mode', () => {
    expect(dailySeed('medium', '2026-09-01')).not.toBe(dailySeed('medium', '2026-09-02'))
  })
})

describe('date handling', () => {
  it('stamps a local calendar date', () => {
    expect(todayStamp(new Date(2026, 8, 1))).toBe('2026-09-01')
    expect(todayStamp(new Date(2026, 0, 9))).toBe('2026-01-09')
  })

  it('counts the epoch as day one', () => {
    expect(dayNumber(DAILY_EPOCH)).toBe(1)
    expect(dayNumber('2026-09-02')).toBe(2)
  })

  it('crosses months and years when shifting', () => {
    expect(shiftStamp('2026-09-01', -1)).toBe('2026-08-31')
    expect(shiftStamp('2026-12-31', 1)).toBe('2027-01-01')
  })

  it('counts a day number across a month boundary', () => {
    // 30 days in September, so 1 Oct is day 31.
    expect(dayNumber('2026-10-01')).toBe(31)
  })

  it('never reports a negative countdown', () => {
    expect(secondsUntilTomorrow(new Date(2026, 8, 1, 23, 59, 59))).toBeGreaterThanOrEqual(0)
    expect(secondsUntilTomorrow(new Date(2026, 8, 1, 0, 0, 0))).toBeLessThanOrEqual(86400)
  })
})

describe('streakOf', () => {
  const today = '2026-09-10'

  it('counts consecutive days ending today', () => {
    expect(streakOf(['2026-09-08', '2026-09-09', '2026-09-10'], today)).toBe(3)
  })

  it('still counts a run that ended yesterday, so today is not lost early', () => {
    expect(streakOf(['2026-09-08', '2026-09-09'], today)).toBe(2)
  })

  it('breaks when a whole day is missed', () => {
    expect(streakOf(['2026-09-06', '2026-09-07'], today)).toBe(0)
  })

  it('ignores duplicates and order', () => {
    expect(streakOf(['2026-09-10', '2026-09-09', '2026-09-10'], today)).toBe(2)
  })

  it('is zero with no history', () => {
    expect(streakOf([], today)).toBe(0)
  })
})

describe('seeded board building', () => {
  it('shuffles identically for the same seed', () => {
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    expect(shuffle(values, mulberry32(7))).toEqual(shuffle(values, mulberry32(7)))
  })

  it('does not mutate what it is given', () => {
    const values = [1, 2, 3, 4, 5]
    const copy = [...values]
    shuffle(values, mulberry32(3))
    expect(values).toEqual(copy)
  })

  it('keeps every element', () => {
    const shuffled = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], mulberry32(11))
    expect([...shuffled].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('lays out identical faces for the same seed', () => {
    const faces = (rng) => createTiles(9, 9, rng).map((row) => row.map((t) => t.index))
    expect(faces(mulberry32(42))).toEqual(faces(mulberry32(42)))
  })

  it('places specials identically for the same seed', () => {
    const kinds = (rng) => {
      const board = createTiles(9, 9, rng)
      seedSpecials(board, { wild: 2, locked: 2, rng })
      return board.map((row) => row.map((t) => t.kind))
    }
    expect(kinds(mulberry32(5))).toEqual(kinds(mulberry32(5)))
  })

  it('still varies without a seed', () => {
    const a = createTiles(9, 9).map((row) => row.map((t) => t.index))
    const b = createTiles(9, 9).map((row) => row.map((t) => t.index))
    expect(a).not.toEqual(b)
  })
})

describe('the daily board', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  const boardOf = (game) => game.tiles.map((row) => row.map((t) => `${t.index}${t.kind}`))

  it('deals the same tiles and the same dice to two players', () => {
    const first = useGameStore()
    first.newGame('medium', null, { daily: true, stamp: '2026-09-01' })
    first.startGame()
    const firstBoard = boardOf(first)
    const firstRoll = first.dice.map((d) => d.number)

    setActivePinia(createPinia())
    const second = useGameStore()
    second.newGame('medium', null, { daily: true, stamp: '2026-09-01' })
    second.startGame()

    expect(boardOf(second)).toEqual(firstBoard)
    expect(second.dice.map((d) => d.number)).toEqual(firstRoll)
  })

  it('deals a different board on a different day', () => {
    const game = useGameStore()
    game.newGame('medium', null, { daily: true, stamp: '2026-09-01' })
    game.startGame()
    const first = boardOf(game)

    game.newGame('medium', null, { daily: true, stamp: '2026-09-02' })
    game.startGame()
    expect(boardOf(game)).not.toEqual(first)
  })

  it('replays the same dice after a restart', () => {
    const game = useGameStore()
    game.newGame('ninja', null, { daily: true, stamp: '2026-09-01' })
    game.startGame()
    const rolls = []
    for (let i = 0; i < 5; i += 1) {
      rolls.push(game.dice.map((d) => d.number))
      game.nextTurn()
    }
    game.stopTimer()

    game.restart()
    game.startGame()
    const again = []
    for (let i = 0; i < 5; i += 1) {
      again.push(game.dice.map((d) => d.number))
      game.nextTurn()
    }
    game.stopTimer()
    expect(again).toEqual(rolls)
  })

  it('accepts a bare shared seed, without being a daily', () => {
    const game = useGameStore()
    game.newGame('medium', null, { seed: 1234 })
    expect(game.seed).toBe(1234)
    expect(game.isDaily).toBe(false)
    expect(game.dayIndex).toBe(null)
  })

  it('reproduces a shared board from its seed alone', () => {
    const game = useGameStore()
    game.newGame('medium', null, { seed: 777 })
    game.startGame()
    const board = boardOf(game)

    setActivePinia(createPinia())
    const other = useGameStore()
    other.newGame('medium', null, { seed: '777' }) // as it arrives from a URL
    other.startGame()
    expect(boardOf(other)).toEqual(board)
  })

  it('is an ordinary random game with no options', () => {
    const game = useGameStore()
    game.newGame('medium')
    expect(game.seed).toBe(null)
    expect(game.isDaily).toBe(false)
  })

  it('records the moves it plays, and forgets them on undo', () => {
    const game = useGameStore()
    game.newGame('beginner', null, { daily: true, stamp: '2026-09-01' })
    game.startGame()
    expect(game.moves).toEqual([])

    const target = game.tiles[0].findIndex((t) => t.isAvailable)
    if (target >= 0) {
      game.playTile(0, target)
      expect(game.moves.length).toBe(1)
      expect(game.moves[0]).toHaveProperty('f')
      game.undo()
      expect(game.moves.length).toBe(0)
    }
  })
})

describe('the shared card', () => {
  it('carries the seed in the link, so the board travels with it', () => {
    const url = challengeUrl('medium', { seed: 4242, day: 7 })
    expect(url).toContain('/challenge/medium.html')
    expect(url).toContain('s=4242')
    expect(url).toContain('d=7')
  })

  it('stays a plain link when there is no seed', () => {
    expect(challengeUrl('ninja')).toBe('https://shutthecube.com/challenge/ninja.html')
  })

  it('names the day so a chat thread can compare like with like', () => {
    const card = scoreCard({
      modeLabel: 'Medium',
      modeKey: 'medium',
      score: 300,
      max: 405,
      rolls: 22,
      won: false,
      day: 12
    })
    expect(card).toContain('SHUT THE CUBE · #12 · MEDIUM')
  })

  it('leaves the day out of an unseeded game', () => {
    const card = scoreCard({
      modeLabel: 'Medium',
      modeKey: 'medium',
      score: 300,
      max: 405,
      rolls: 22,
      won: false
    })
    expect(card).toContain('SHUT THE CUBE · MEDIUM')
    expect(card).not.toContain('#')
  })

  it('shows a streak only once it is worth protecting', () => {
    const base = { modeLabel: 'Medium', modeKey: 'medium', score: 1, max: 405, rolls: 2, won: false }
    expect(scoreCard({ ...base, streak: 1 })).not.toContain('🔥')
    expect(scoreCard({ ...base, streak: 4 })).toContain('🔥 4 day streak')
  })
})
