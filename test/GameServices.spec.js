import { describe, expect, it } from 'vitest'
import { filter, flatMap, flatMapDeep, groupBy, isEqual, sortBy, sum, uniq, uniqWith } from 'lodash-es'
import {
  combinationsSummingTo,
  createTiles,
  faceCounts,
  getTilesIndexCombinations,
  moveTile,
  subsetsSummingTo,
  sumTilesWhere
} from '../src/services/gameServices.js'

/**
 * The pre-rewrite algorithm, transcribed from the js-combinatorics version.
 * `power(values).lazyFilter(sum === target).toArray()` is exactly "every subset,
 * enumerated by binary counter, keeping those that hit the target", so it can be
 * reproduced with a bitmask loop. The new implementation must agree with this.
 */
const legacyPowerSetSums = (values, target) => {
  const out = []
  for (let mask = 0; mask < 1 << values.length; mask++) {
    const subset = []
    let running = 0
    for (let i = 0; i < values.length; i++) {
      if (mask & (1 << i)) {
        subset.push(values[i])
        running += values[i]
      }
    }
    if (running === target) out.push(subset)
  }
  return out
}

const legacyGetTilesIndexCombinations = (tiles, target) => {
  const tilesPlayable = uniq(
    flatMapDeep(tiles, (n) => flatMapDeep(n, (i) => (!i.isInUse && !i.isTaken ? i.index : [])))
  )
  const tilesPlayableNonUnique = sortBy(
    filter(
      flatMapDeep(tiles, (n) =>
        flatMapDeep(n, (i) => (!i.isInUse && !i.isTaken && i.index <= target ? i.index : false))
      ),
      (n) => n
    ),
    (n) => n
  )
  const tilesPlayableNumbers = uniqWith(legacyPowerSetSums(tilesPlayable, target), isEqual)
  const reduceListTilesNumbers = []
  Object.values(groupBy(tilesPlayableNonUnique, Math.floor)).forEach((numbers) => {
    const reduceTileNumber = []
    let sumNumbers = 0
    numbers.forEach((n) => {
      sumNumbers += n
      if (sumNumbers <= target) reduceTileNumber.push(n)
    })
    if (require_intersection(flatMap(tilesPlayableNumbers), reduceTileNumber).length === 0) {
      reduceListTilesNumbers.push(reduceTileNumber)
    }
  })
  const combinationDupeNumbers = uniqWith(
    legacyPowerSetSums(flatMapDeep(reduceListTilesNumbers), target),
    isEqual
  )
  return uniq(flatMapDeep([...tilesPlayableNumbers, ...combinationDupeNumbers]))
}
const require_intersection = (a, b) => a.filter((x) => b.includes(x))

/** Deterministic PRNG so a failure is reproducible. */
const makeRandom = (seed) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296
  return seed / 4294967296
}

const randomiseTileState = (tiles, random) => {
  tiles.forEach((row) =>
    row.forEach((t) => {
      const roll = random()
      t.isTaken = roll < 0.35
      t.isInUse = !t.isTaken && roll < 0.45
    })
  )
  return tiles
}

describe('createTiles', () => {
  it('builds the requested number of rows', () => {
    expect(createTiles(9, 9)).toHaveLength(9)
    expect(createTiles(9, 1)).toHaveLength(1)
  })

  it('gives every row all nine faces exactly once', () => {
    for (const row of createTiles(9, 9)) {
      expect(sortBy(row.map((t) => t.index))).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    }
  })

  it('gives every tile a unique id', () => {
    const tiles = createTiles(9, 9)
    const ids = tiles.flat().map((t) => t.id)
    expect(uniq(ids)).toHaveLength(81)
  })

  it('starts every tile untaken and unavailable', () => {
    for (const t of createTiles(9, 9).flat()) {
      expect(t).toMatchObject({ isAvailable: false, isInUse: false, isTaken: false })
    }
  })

  it('assigns each face its own colour', () => {
    const byFace = new Map()
    for (const t of createTiles(9, 9).flat()) byFace.set(t.index, t.cssClass)
    expect(new Set(byFace.values()).size).toBe(9)
    expect(byFace.get(1)).toBe('bg-green-lighter')
    expect(byFace.get(9)).toBe('bg-yellow-light')
  })
})

describe('subsetsSummingTo', () => {
  it('agrees with a full power-set search', () => {
    const cases = [
      [[1, 2, 3, 4, 5, 6, 7, 8, 9], 7],
      [[1, 2, 3, 4, 5, 6, 7, 8, 9], 12],
      [[2, 4, 6, 8], 10],
      [[1, 1, 1, 2, 2, 3], 4],
      [[5], 5],
      [[9], 3]
    ]
    for (const [values, target] of cases) {
      const mine = uniqWith(subsetsSummingTo(values, target), isEqual).map((s) => sortBy(s))
      const legacy = uniqWith(legacyPowerSetSums(values, target), isEqual).map((s) => sortBy(s))
      expect(sortBy(mine, String)).toEqual(sortBy(legacy, String))
    }
  })

  it('returns only the empty subset for a target of zero', () => {
    expect(subsetsSummingTo([1, 2, 3], 0)).toEqual([[]])
  })

  it('returns nothing when the target is unreachable', () => {
    expect(subsetsSummingTo([2, 4, 6], 5)).toEqual([])
  })
})

/**
 * Ground truth: a face is playable when some selection of the open tiles that
 * includes it adds up to the target. Exhaustive, so only for small boards.
 */
const brutePlayableFaces = (tiles, target) => {
  const open = tiles.flat().filter((t) => !t.isInUse && !t.isTaken)
  const found = new Set()
  const walk = (i, remaining, used) => {
    if (remaining === 0) {
      used.forEach((f) => found.add(f))
      return
    }
    if (i >= open.length || remaining < 0) return
    walk(i + 1, remaining - open[i].index, [...used, open[i].index])
    walk(i + 1, remaining, used)
  }
  walk(0, target, [])
  return [...found].sort((a, b) => a - b)
}

describe('getTilesIndexCombinations', () => {
  it('reports exactly the faces that can complete the roll', () => {
    const random = makeRandom(20260831)
    for (let run = 0; run < 30; run++) {
      const rows = [1, 2, 3][run % 3]
      const tiles = randomiseTileState(createTiles(9, rows), random)
      for (let target = 2; target <= 12; target++) {
        expect(
          getTilesIndexCombinations(tiles, target),
          `rows=${rows} target=${target} run=${run}`
        ).toEqual(brutePlayableFaces(tiles, target))
      }
    }
  })

  it('never offers fewer moves than the pre-rewrite search', () => {
    // The old two-pass search looked at distinct faces, then at repeats of a
    // single face, and nothing else — so it missed moves needing repeats of
    // two different faces and greyed out tiles that were legal to play.
    const random = makeRandom(4242)
    let strictlyMore = 0
    for (let run = 0; run < 40; run++) {
      const rows = [1, 2, 3, 9][run % 4]
      const tiles = randomiseTileState(createTiles(9, rows), random)
      for (let target = 2; target <= 12; target++) {
        const now = getTilesIndexCombinations(tiles, target)
        const before = sortBy(legacyGetTilesIndexCombinations(tiles, target))
        expect(before.every((f) => now.includes(f)), `target=${target} run=${run}`).toBe(true)
        if (now.length > before.length) strictlyMore++
      }
    }
    expect(strictlyMore, 'the old search should be missing moves somewhere').toBeGreaterThan(0)
  })

  it('finds a move needing repeats of two different faces', () => {
    // 2 + 2 + 1 makes 5; the old search could not see it.
    const tiles = createTiles(9, 3)
    tiles.forEach((row) => row.forEach((t) => (t.isTaken = ![1, 2].includes(t.index))))
    tiles[0].forEach((t) => (t.isTaken = t.index !== 1))
    expect(getTilesIndexCombinations(tiles, 5)).toContain(2)
  })

  it('only ever offers faces that are still in play', () => {
    const tiles = createTiles(9, 3)
    tiles.forEach((row) => row.forEach((t) => (t.isTaken = t.index > 4)))
    expect(getTilesIndexCombinations(tiles, 7).every((face) => face <= 4)).toBe(true)
  })

  it('finds a repeated face across rows when no single-row move exists', () => {
    // Only 3s left, in three rows: 6 is reachable only by taking two of them.
    const tiles = createTiles(9, 3)
    tiles.forEach((row) => row.forEach((t) => (t.isTaken = t.index !== 3)))
    expect(getTilesIndexCombinations(tiles, 6)).toContain(3)
  })

  it('returns nothing when the board is finished', () => {
    const tiles = createTiles(9, 2)
    tiles.forEach((row) => row.forEach((t) => (t.isTaken = true)))
    expect(getTilesIndexCombinations(tiles, 7)).toEqual([])
  })

  it('completes quickly on a full nine-row board', () => {
    const tiles = createTiles(9, 9)
    const started = performance.now()
    for (let target = 2; target <= 18; target++) getTilesIndexCombinations(tiles, target)
    expect(performance.now() - started).toBeLessThan(50)
  })
})

describe('combinationsSummingTo', () => {
  it('lists each distinct combination once', () => {
    const counts = new Map([[1, 2], [2, 2], [3, 1]])
    const combos = combinationsSummingTo(counts, 4).map((c) => c.join('+'))
    expect(combos.sort()).toEqual(['1+1+2', '1+3', '2+2'].sort())
  })

  it('respects how many copies of a face are actually on the board', () => {
    expect(combinationsSummingTo(new Map([[2, 1]]), 4)).toEqual([])
    expect(combinationsSummingTo(new Map([[2, 2]]), 4)).toEqual([[2, 2]])
  })

  it('puts the shortest combination first, so a hint leads with it', () => {
    const combos = combinationsSummingTo(new Map([[1, 9], [2, 9], [7, 9]]), 7)
    expect(combos[0]).toEqual([7])
  })

  it('returns nothing for a target of zero or less', () => {
    expect(combinationsSummingTo(new Map([[1, 9]]), 0)).toEqual([])
    expect(combinationsSummingTo(new Map([[1, 9]]), -3)).toEqual([])
  })

  it('stays cheap on a full board, where enumerating tiles did not', () => {
    // Per-tile enumeration produced 627,756 subsets for a roll of 12 here.
    const counts = faceCounts(createTiles(9, 9))
    const started = performance.now()
    const combos = combinationsSummingTo(counts, 12)
    expect(performance.now() - started).toBeLessThan(20)
    expect(combos.length).toBeLessThan(200)
  })
})

describe('moveTile', () => {
  it('pushes the played tile and taken tiles to the end, keeping the rest in order', () => {
    const row = [
      { id: 'a', isTaken: false },
      { id: 'b', isTaken: true },
      { id: 'c', isTaken: false },
      { id: 'd', isTaken: false }
    ]
    expect(moveTile(row, 'c').map((t) => t.id)).toEqual(['a', 'd', 'b', 'c'])
  })
})

describe('sumTilesWhere', () => {
  it('adds up face values across every row', () => {
    const tiles = createTiles(9, 2)
    expect(sumTilesWhere(tiles, () => true)).toBe(90)
    expect(sumTilesWhere(tiles, (t) => t.index === 9)).toBe(18)
    expect(sumTilesWhere(tiles, () => false)).toBe(0)
  })
})
