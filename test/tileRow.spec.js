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

/**
 * Put `face` at position 0 in rows [from, to), and something else at position 0
 * of the next row, so the run has a definite length rather than whatever the
 * shuffle happened to leave underneath it.
 */
const alignAt = (from, to, face) => {
  game.tiles.slice(from, to).forEach((row) => {
    const at = row.findIndex((t) => t.index === face)
    row.splice(0, 0, row.splice(at, 1)[0])
  })
  const below = game.tiles[to]
  if (below) {
    const other = below.findIndex((t) => t.index !== face)
    below.splice(0, 0, below.splice(other, 1)[0])
  }
}


let game
let pinia

beforeEach(() => {
  pinia = createPinia()
  setActivePinia(pinia)
  localStorage.clear()
  vi.spyOn(Math, 'random').mockReturnValue(0.5) // both dice show 4, so a roll of 8
  game = useGameStore()
  game.newGame('medium')
  // These cover the ordinary tile rules; specials have their own tests.
  game.tiles.forEach((row) => row.forEach((x) => (x.kind = 'normal')))
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
    // A pinned Math.random shuffles every row the same way, which lines the
    // columns up and puts every tile in a nine-long run — and a tile in a run
    // is labelled with its length instead. Rotating the row underneath breaks
    // the alignment, so row 0 has tiles that stand on their own.
    game.tiles[1].push(game.tiles[1].shift())
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

describe('run indicator', () => {
  it('badges a tile that would take a whole column with it', async () => {
    alignAt(0, 3, 4)
    game.refreshAvailability(false)
    const row = mountRow(0)
    await row.vm.$nextTick()

    const badge = row.findAll('.run-badge')[0]
    expect(badge.text()).toBe('3')
    expect(row.findAll('button')[0].classes()).toContain('hasRun')
  })

  it('shows no badge for a tile that stands alone', async () => {
    const row = mountRow(0)
    await row.vm.$nextTick()
    const lone = game.tiles[0].findIndex((t) => !game.runSizes[t.id] && t.isAvailable)
    if (lone >= 0) {
      expect(row.findAll('button')[lone].classes()).not.toContain('hasRun')
    }
  })

  it('says how many tiles a run takes, for screen readers', async () => {
    alignAt(0, 2, 4)
    game.refreshAvailability(false)
    const row = mountRow(0)
    await row.vm.$nextTick()
    expect(row.findAll('button')[0].attributes('aria-label')).toContain('takes 2 tiles together')
  })

  it('previews the run on hover, and only when there is one', async () => {
    alignAt(0, 3, 4)
    game.refreshAvailability(false)
    const row = mountRow(0)

    await row.findAll('button')[0].trigger('pointerenter')
    expect(game.previewIds).toHaveLength(3)

    await row.findAll('button')[0].trigger('pointerleave')
    expect(game.previewIds).toHaveLength(0)
  })
})

describe('rendering', () => {
  it('shows each tile face and its colour', () => {
    const row = mountRow(0)
    const buttons = row.findAll('button')
    expect(buttons).toHaveLength(9)
    buttons.forEach((button, i) => {
      const tile = game.tiles[0][i]
      // .number, not the button text: the button may also carry a run badge.
      expect(button.find('.number').text()).toBe(String(tile.index))
      expect(button.classes()).toContain(tile.cssClass)
    })
  })

  it('disables taken tiles', async () => {
    game.tiles[0][0].isTaken = true
    const row = mountRow(0)
    await row.vm.$nextTick()
    expect(row.findAll('button')[0].attributes('disabled')).toBeDefined()
  })

  it('gives every tile of a claimed combination the same colour', async () => {
    alignAt(0, 3, 4)
    game.refreshAvailability(false)
    const row = mountRow(1)
    await row.findAll('button')[0].trigger('click')

    const claimed = game.tiles.slice(0, 3).map((r) => r[0])
    expect(claimed.every((t) => t.isInUse)).toBe(true)
    // One move reads as one colour; only the bonus marker differs.
    expect(claimed.filter((t) => t.isCollateral)).toHaveLength(2)
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
