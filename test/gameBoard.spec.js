import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import GameBoard from '../src/components/GameBoard.vue'
import { useGameStore } from '../src/stores/game.js'
import { useStatsStore } from '../src/stores/stats.js'

let game
let pinia

const mountBoard = () => mount(GameBoard, { global: { plugins: [pinia] }, attachTo: document.body })

/** Shut every tile, which is what winning means. */
const winTheGame = () => {
  game.tiles.forEach((row) => row.forEach((t) => (t.isTaken = true)))
  game.sumTilesTaken = game.rows * 45
  game.state = 'isWin'
  game.note = 'Shut The Box'
}

beforeEach(() => {
  pinia = createPinia()
  setActivePinia(pinia)
  localStorage.clear()
  vi.spyOn(Math, 'random').mockReturnValue(0.5)
  game = useGameStore()
  game.newGame('beginner')
})

describe('the result screen', () => {
  it('leads with the win, not with the button', () => {
    winTheGame()
    const board = mountBoard()
    const title = board.find('.result-title')
    expect(title.text()).toBe('BOX SHUT!')
    // The headline must be the largest thing on the panel.
    const again = board.find('.again')
    expect(again.exists()).toBe(true)
    expect(title.element.tagName).toBe('H2')
    expect(again.text()).toContain('PLAY AGAIN')
  })

  it('shows the score against the perfect score', () => {
    winTheGame()
    const board = mountBoard()
    expect(board.find('.result-score').text()).toContain('45')
    expect(board.find('.result-score').text()).toContain('of 45 points')
  })

  it('calls out a personal best', () => {
    const stats = useStatsStore()
    stats.record('beginner', 45, true)
    winTheGame()
    const board = mountBoard()
    expect(board.find('.pb').text()).toContain('New personal best')
  })

  it('reads differently when the game was lost', () => {
    game.tiles.forEach((row) => row.forEach((t) => (t.isTaken = t.index < 5)))
    game.sumTilesTaken = 10
    game.state = 'isOver'
    game.note = 'Game Over'
    const board = mountBoard()
    expect(board.find('.result-title').text()).toBe('Game over')
    expect(board.find('.result').classes()).toContain('isOver')
  })

  it('shows no result panel while a game is in progress', () => {
    game.startGame()
    const board = mountBoard()
    expect(board.find('.result').exists()).toBe(false)
  })
})

describe('celebrations', () => {
  it('calls out a claimed run', async () => {
    game.startGame()
    game.celebrate('Triple', '3 tiles in one move')
    const board = mountBoard()
    await board.vm.$nextTick()
    expect(board.find('.celebration strong').text()).toBe('Triple')
    expect(board.find('.celebration span').text()).toBe('3 tiles in one move')
  })
})

describe('the dice row', () => {
  it('shows only the dice actually in play', async () => {
    game.startGame()
    const board = mountBoard()
    await board.vm.$nextTick()
    expect(board.findAll('.die')).toHaveLength(2)
  })

  it('drops to a single die once six or less is left on the board', async () => {
    // 1 + 2 + 3 = 6, the point at which two dice can overshoot everything left.
    game.tiles[0].forEach((t) => (t.isTaken = t.index > 3))
    expect(game.openTotal).toBe(6)
    expect(game.mustRollSingleDie).toBe(true)
    game.startGame()
    const board = mountBoard()
    await board.vm.$nextTick()
    expect(board.findAll('.die')).toHaveLength(1)
    expect(board.find('.single-note').text()).toContain('only 6 left')
  })
})
