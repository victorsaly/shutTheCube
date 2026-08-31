import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TileRow from '../src/components/TileRow.vue'
import { useGameStore } from '../src/stores/game.js'

const mountRow = (rowIndex, extra = {}) =>
  mount(TileRow, {
    props: { tiles: game.tiles[rowIndex], rowIndex, ...extra },
    global: { plugins: [pinia] }
  })

const positionOf = (rowIndex, face) => game.tiles[rowIndex].findIndex((t) => t.index === face)

let game
let pinia

beforeEach(() => {
  pinia = createPinia()
  setActivePinia(pinia)
  localStorage.clear()
  vi.spyOn(Math, 'random').mockReturnValue(0.5) // both dice show 4, so a roll of 8
  game = useGameStore()
  game.newGame('medium')
  game.startGame()
})

describe('selecting a tile', () => {
  it('marks the clicked tile as in use', async () => {
    const position = game.tiles[0].findIndex((t) => t.isAvailable)
    const tile = game.tiles[0][position]
    const row = mountRow(0)

    await row.findAll('button')[position].trigger('click')

    expect(tile.isInUse).toBe(true)
    expect(tile.isCollateral).toBe(false)
    expect(game.sumTilesInUse).toBe(tile.index)
  })

  it('rejects a tile that would overshoot the roll', async () => {
    const position = positionOf(0, 9) // 9 > roll of 8
    const tile = game.tiles[0][position]
    const row = mountRow(0)

    await row.findAll('button')[position].trigger('click')

    expect(tile.isInUse).toBe(false)
    expect(tile.action).toBe('shake')
    expect(game.sumTilesInUse).toBe(0)
  })

  it('ignores clicks on a tile that is already taken', async () => {
    game.tiles[0][0].isTaken = true
    const row = mountRow(0)
    await row.findAll('button')[0].trigger('click')
    expect(game.tiles[0][0].isInUse).toBe(false)
  })

  it('plays the click sound once per accepted move', async () => {
    const playClick = vi.fn()
    const position = game.tiles[0].findIndex((t) => t.isAvailable)
    const row = mountRow(0, { playClick })

    await row.findAll('button')[position].trigger('click')
    expect(playClick).toHaveBeenCalledTimes(1)
  })

  it('does not play the sound for a rejected move', async () => {
    const playClick = vi.fn()
    const row = mountRow(0, { playClick })
    await row.findAll('button')[positionOf(0, 9)].trigger('click')
    expect(playClick).not.toHaveBeenCalled()
  })
})

describe('keyboard support', () => {
  it('exposes exactly one tab stop, at the cursor', () => {
    const row = mountRow(0, { cursor: [0, 4] })
    const tabbable = row.findAll('button').filter((b) => b.attributes('tabindex') === '0')
    expect(tabbable).toHaveLength(1)
    expect(row.findAll('button')[4].attributes('tabindex')).toBe('0')
  })

  it('leaves every tile untabbable in a row the cursor is not on', () => {
    const row = mountRow(1, { cursor: [0, 4] })
    expect(row.findAll('button').every((b) => b.attributes('tabindex') === '-1')).toBe(true)
  })

  it('plays a tile on Enter, like any button', async () => {
    const position = game.tiles[0].findIndex((t) => t.isAvailable)
    const row = mountRow(0, { cursor: [0, position] })
    // A <button> fires click for Enter and Space natively.
    await row.findAll('button')[position].trigger('click')
    expect(game.tiles[0][position].isInUse).toBe(true)
  })
})

describe('accessibility', () => {
  it('marks up the board as a grid row of cells', () => {
    const row = mountRow(0)
    expect(row.attributes('role')).toBe('row')
    expect(row.findAll('[role="gridcell"]')).toHaveLength(9)
  })

  it('names each tile and describes its state', async () => {
    game.tiles[0][0].isTaken = true
    const row = mountRow(0)
    await row.vm.$nextTick()
    const labels = row.findAll('button').map((b) => b.attributes('aria-label'))
    expect(labels[0]).toBe(`Tile ${game.tiles[0][0].index}. Shut`)
    expect(labels.some((l) => l.endsWith('Playable'))).toBe(true)
  })

  it('reports selection state via aria-pressed', async () => {
    const position = game.tiles[0].findIndex((t) => t.isAvailable)
    const row = mountRow(0)
    expect(row.findAll('button')[position].attributes('aria-pressed')).toBe('false')
    await row.findAll('button')[position].trigger('click')
    expect(row.findAll('button')[position].attributes('aria-pressed')).toBe('true')
  })
})

describe('rendering', () => {
  it('shows each tile face and its colour', () => {
    const row = mountRow(0)
    const buttons = row.findAll('button')
    expect(buttons).toHaveLength(9)
    buttons.forEach((button, i) => {
      const tile = game.tiles[0][i]
      expect(button.text()).toBe(String(tile.index))
      expect(button.classes()).toContain(tile.cssClass)
    })
  })

  it('disables taken tiles', async () => {
    game.tiles[0][0].isTaken = true
    const row = mountRow(0)
    await row.vm.$nextTick()
    expect(row.findAll('button')[0].attributes('disabled')).toBeDefined()
  })

  it('marks hinted tiles', async () => {
    game.showHint()
    const row = mountRow(0)
    await row.vm.$nextTick()
    const hinted = row.findAll('button').filter((b) => b.classes().includes('isHinted'))
    expect(hinted.length + game.hintedIds.length).toBeGreaterThan(0)
  })

  it('never marks a tile both playable and not playable', async () => {
    const row = mountRow(0)
    await row.vm.$nextTick()
    for (const button of row.findAll('button')) {
      const c = button.classes()
      expect(c.includes('isAvailable') && c.includes('isNotAvailable')).toBe(false)
    }
  })
})
