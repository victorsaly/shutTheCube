import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TileRow from '../src/components/TileRow.vue'
import { useGameStore } from '../src/stores/game.js'

/** Line up `face` at the same position in every row, so a run exists. */
const alignFace = (game, position, face) => {
  game.tiles.forEach((row) => {
    const at = row.findIndex((t) => t.index === face)
    const [tile] = row.splice(at, 1)
    row.splice(position, 0, tile)
  })
}

const mountRow = (game, rowIndex) =>
  mount(TileRow, {
    props: { tiles: game.tiles[rowIndex], rowIndex, allTiles: game.tiles },
    global: { plugins: [pinia] }
  })

let game
let pinia

beforeEach(() => {
  pinia = createPinia()
  setActivePinia(pinia)
  localStorage.clear()
  vi.spyOn(Math, 'random').mockReturnValue(0.5) // both dice show 4, so a roll of 8
  game = useGameStore()
  game.newGame(3)
  game.startGame()
})

describe('selecting a tile', () => {
  it('marks the clicked tile as in use', async () => {
    const position = game.tiles[0].findIndex((t) => t.isAvailable)
    const tile = game.tiles[0][position]
    const row = mountRow(game, 0)

    await row.findAll('button')[position].trigger('click')

    expect(tile.isInUse).toBe(true)
    expect(tile.isCollateral).toBe(false)
    expect(game.sumTilesInUse).toBe(tile.index)
  })

  it('claims the same face in adjacent rows, as bonus tiles', async () => {
    alignFace(game, 0, 3)
    game.refreshAvailability(false)
    const row = mountRow(game, 1)

    await row.findAll('button')[0].trigger('click')

    const claimed = game.tiles.map((r) => r[0])
    expect(claimed.every((t) => t.index === 3 && t.isInUse)).toBe(true)
    expect(claimed.map((t) => t.isCollateral)).toEqual([true, false, true])
    // Only the clicked tile counts toward the roll; the run is bonus.
    expect(game.sumTilesInUse).toBe(3)
  })

  it('stops claiming as soon as the run of matching faces breaks', async () => {
    // Rows 0 and 1 share a 5 at position 0; row 2 has something else there.
    game.tiles.slice(0, 2).forEach((r) => {
      const at = r.findIndex((t) => t.index === 5)
      r.splice(0, 0, r.splice(at, 1)[0])
    })
    const at2 = game.tiles[2].findIndex((t) => t.index === 2)
    game.tiles[2].splice(0, 0, game.tiles[2].splice(at2, 1)[0])
    game.refreshAvailability(false)

    const row = mountRow(game, 0)
    await row.findAll('button')[0].trigger('click')

    expect(game.tiles[0][0].isInUse).toBe(true)
    expect(game.tiles[1][0].isInUse).toBe(true)
    expect(game.tiles[2][0].isInUse).toBe(false)
  })

  it('will not claim a face that has already been taken', async () => {
    alignFace(game, 0, 3)
    game.tiles[1][0].isTaken = true
    game.refreshAvailability(false)

    const row = mountRow(game, 0)
    await row.findAll('button')[0].trigger('click')

    expect(game.tiles[0][0].isInUse).toBe(true)
    expect(game.tiles[2][0].isInUse).toBe(false) // the run is broken by row 1
  })

  it('rejects a tile that would overshoot the roll', async () => {
    const position = game.tiles[0].findIndex((t) => t.index === 9) // 9 > roll of 8
    const tile = game.tiles[0][position]
    const row = mountRow(game, 0)

    await row.findAll('button')[position].trigger('click')

    expect(tile.isInUse).toBe(false)
    expect(tile.action).toBe('shake')
    expect(game.sumTilesInUse).toBe(0)
  })

  it('ignores clicks on a tile that is already taken', async () => {
    game.tiles[0][0].isTaken = true
    const row = mountRow(game, 0)

    await row.findAll('button')[0].trigger('click')

    expect(game.tiles[0][0].isInUse).toBe(false)
  })

  it('plays the click sound once per accepted move', async () => {
    const playClick = vi.fn()
    const position = game.tiles[0].findIndex((t) => t.isAvailable)
    const row = mount(TileRow, {
      props: { tiles: game.tiles[0], rowIndex: 0, allTiles: game.tiles, playClick },
      global: { plugins: [pinia] }
    })

    await row.findAll('button')[position].trigger('click')
    expect(playClick).toHaveBeenCalledTimes(1)
  })
})

describe('rendering', () => {
  it('shows each tile face and its colour', () => {
    const row = mountRow(game, 0)
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
    const row = mountRow(game, 0)
    await row.vm.$nextTick()
    expect(row.findAll('button')[0].attributes('disabled')).toBeDefined()
  })
})
