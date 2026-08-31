import { filter, flatMapDeep, flatten, groupBy, intersection, isEqual, shuffle as _shuffle, sortBy, sum as _sum, uniq, uniqWith } from 'lodash-es'

/** Tailwind colour assigned to each tile face, 1-9. */
const TILE_COLOURS = {
  1: 'bg-green-lighter',
  2: 'bg-purple-lighter',
  3: 'bg-blue-light',
  4: 'bg-purple-light',
  5: 'bg-yellow-lighter',
  6: 'bg-indigo-lighter',
  7: 'bg-red-light',
  8: 'bg-red-lighter',
  9: 'bg-yellow-light'
}

const newTile = (index) => ({
  index,
  id: createGuid(),
  isAvailable: false,
  isInUse: false,
  isTaken: false,
  isCollateral: false,
  isExplosion: false,
  action: '',
  cssClass: TILE_COLOURS[index] ?? 'bg-blue-light'
})

export const createGuid = () =>
  globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
      })

export const shuffle = (values) => (Array.isArray(values) ? _shuffle(values) : values)

/**
 * Build `rows` rows of `numberTiles` tiles, each row independently shuffled.
 * One row is "Shut The Box"; nine rows is "Shut The Cube".
 */
export const createTiles = (numberTiles, rows) => {
  const faces = Array.from({ length: numberTiles }, (_, i) => i + 1)
  return Array.from({ length: rows }, () => shuffle(faces).map((index) => newTile(index)))
}

/** Slide a played tile (and anything already taken) to the end of its row. */
export const moveTile = (tiles, id) =>
  sortBy(tiles, (tile) => (tile.id === id || tile.isTaken ? 1 : 0))

export const isMobile = () =>
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent) ||
  // iPadOS 13+ reports itself as a Mac, so fall back to touch support.
  (navigator.maxTouchPoints > 1 && /Macintosh/i.test(navigator.userAgent))

/**
 * Every subset of `values` that adds up to exactly `target`, duplicates included.
 *
 * This replaces `js-combinatorics@0.5.3`'s `power(...).lazyFilter(...)`, which
 * materialised all 2^n subsets before filtering. Because every tile face is a
 * positive integer, the search can prune any branch that has already overshot
 * the target, which produces the same set of subsets far more cheaply.
 * Subsets come back in a different order than the old power-set enumeration;
 * only membership is ever used downstream.
 */
export const subsetsSummingTo = (values, target) => {
  const results = []
  const chosen = []
  const walk = (index, running) => {
    if (running === target) {
      results.push(chosen.slice())
      return
    }
    if (running > target || index >= values.length) return
    chosen.push(values[index])
    walk(index + 1, running + values[index])
    chosen.pop()
    walk(index + 1, running)
  }
  walk(0, 0)
  return results
}

const playableFaces = (tiles) =>
  flatMapDeep(tiles, (row) => flatMapDeep(row, (t) => (!t.isInUse && !t.isTaken ? t.index : [])))

/**
 * The distinct tile faces that can still legally be played toward `sum`.
 *
 * Two passes, because a face can appear once per row: first the combinations
 * available from the distinct faces, then combinations that need the *same*
 * face from several rows at once (e.g. three 2s to make 6), for any face group
 * the first pass did not already cover.
 */
export const getTilesIndexCombinations = (tiles, sum) => {
  const distinctFaces = uniq(playableFaces(tiles))
  const combinations = uniqWith(subsetsSummingTo(distinctFaces, sum), isEqual)

  // Faces low enough to be usable, one entry per row that still holds them.
  const repeatableFaces = sortBy(
    filter(
      flatMapDeep(tiles, (row) =>
        flatMapDeep(row, (t) => (!t.isInUse && !t.isTaken && t.index <= sum ? t.index : []))
      )
    )
  )

  const alreadyCovered = flatten(combinations)
  const repeatable = []
  for (const group of Object.values(groupBy(repeatableFaces, Math.floor))) {
    const usable = []
    let running = 0
    for (const face of group) {
      running += face
      if (running <= sum) usable.push(face)
    }
    if (intersection(alreadyCovered, usable).length === 0) repeatable.push(usable)
  }

  const repeatCombinations = uniqWith(subsetsSummingTo(flatten(repeatable), sum), isEqual)

  return uniq(flatten([...combinations, ...repeatCombinations]))
}

/** Total face value of the tiles matching `predicate`, across every row. */
export const sumTilesWhere = (tiles, predicate) =>
  _sum(tiles.map((row) => _sum(filter(row, predicate).map((t) => t.index))))

export default {
  createGuid,
  createTiles,
  getTilesIndexCombinations,
  isMobile,
  moveTile,
  shuffle,
  subsetsSummingTo,
  sumTilesWhere
}
