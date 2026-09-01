import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useGameStore } from '@/stores/game'
import { useMatchStore } from '@/stores/match'
import { useStatsStore } from '@/stores/stats'

describe('pass-and-play match', () => {
  let game, match

  beforeEach(() => {
    setActivePinia(createPinia())
    game = useGameStore()
    match = useMatchStore()
    localStorage.clear()
  })

  it('snapshots the board: faces and specials, no play state', () => {
    game.newGame('medium')
    game.tiles[2][3].kind = 'wild'
    game.tiles[2][3].isTaken = true
    match.begin('medium', game.tiles)

    expect(match.layout[2][3].kind).toBe('wild')
    expect(match.layout[2][3].index).toBe(game.tiles[2][3].index)
    expect(match.layout[2][3].isTaken).toBeUndefined()
  })

  it('deals player 2 the same board with every flag fresh', () => {
    game.newGame('medium')
    game.tiles[1][1].kind = 'locked'
    match.begin('medium', game.tiles)
    const face = game.tiles[1][1].index

    // Player 1 wrecks the board; the handoff must not carry any of it.
    game.tiles.forEach((row) => row.forEach((t) => (t.isTaken = true)))
    game.newGame(match.modeKey, match.layout)

    expect(game.tiles[1][1].kind).toBe('locked')
    expect(game.tiles[1][1].index).toBe(face)
    expect(game.tiles.flat().every((t) => !t.isTaken && !t.isInUse)).toBe(true)
  })

  it('routes the two games to the right players and settles the winner', () => {
    match.begin('medium', [])
    match.record(231, false, 12)
    expect(match.stage).toBe('p1')
    match.advance()
    match.record(267, false, 14)
    expect(match.stage).toBe('done')
    expect(match.winner).toBe('p2')
    expect(match.target).toBe(231)
  })

  it('breaks a shut-box tie on rolls, and calls the rest a draw', () => {
    match.begin('beginner', [])
    match.record(45, true, 6)
    match.advance()
    match.record(45, true, 5)
    expect(match.winner).toBe('p2')

    match.begin('beginner', [])
    match.record(30, false, 6)
    match.advance()
    match.record(30, false, 9)
    expect(match.winner).toBe('draw')
  })

  it('keeps match games out of the solo record', () => {
    const stats = useStatsStore()
    game.newGame('beginner')
    match.begin('beginner', game.tiles)
    game.startGame()
    // Force the game over: everything taken means the next refresh ends it.
    game.tiles.forEach((row) => row.forEach((t) => (t.isTaken = true)))
    game.refreshAvailability(true)

    expect(game.isFinished).toBe(true)
    expect(match.results.p1).not.toBeNull()
    expect(stats.hasPlayed('beginner')).toBe(false)
  })
})
