import { filter, flatMapDeep, flatten, groupBy, intersection, isEqual, sortBy, sum as _sum, uniq, uniqWith } from 'lodash-es'

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
  /** 'normal' | 'wild' | 'locked' — see stores/modes.js. */
  kind: 'normal',
  /** What a wild tile counted for on the turn it was played. */
  wildValue: null,
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

/**
 * Fisher-Yates over a caller-supplied source of randomness.
 *
 * Hand-rolled rather than lodash's `shuffle` because that draws from
 * `Math.random` with no way in: a seeded board has to be able to supply its
 * own stream. With no `rng` passed the behaviour is unchanged.
 */
export const shuffle = (values, rng = Math.random) => {
  if (!Array.isArray(values)) return values
  const out = [...values]
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Build `rows` rows of `numberTiles` tiles, each row independently shuffled.
 * One row is "Shut The Box"; nine rows is "Shut The Cube".
 */
export const createTiles = (numberTiles, rows, rng = Math.random) => {
  const faces = Array.from({ length: numberTiles }, (_, i) => i + 1)
  return Array.from({ length: rows }, () => shuffle(faces, rng).map((index) => newTile(index)))
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
 * Exponential in the number of values, so it is not used on a whole board —
 * `combinationsSummingTo` counts combinations instead. Kept for small inputs
 * and for checking the faster routines against an exhaustive search.
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

/** How many still-playable copies of each face are on the board. */
export const faceCounts = (tiles) => {
  const counts = new Map()
  for (const row of tiles) {
    for (const tile of row) {
      if (tile.isInUse || tile.isTaken) continue
      counts.set(tile.index, (counts.get(tile.index) ?? 0) + 1)
    }
  }
  return counts
}

/**
 * Which totals are reachable from a multiset of faces, as a bounded knapsack.
 * Targets are at most three dice, so this is a handful of tiny passes.
 */
const reachable = (counts, target) => {
  const dp = new Uint8Array(target + 1)
  dp[0] = 1
  for (const [face, count] of counts) {
    if (face > target) continue
    for (let copy = 0; copy < count; copy++) {
      for (let total = target; total >= face; total--) {
        if (dp[total - face]) dp[total] = 1
      }
    }
  }
  return dp
}

/**
 * The distinct tile faces that can still be played toward `sum`.
 *
 * A face qualifies when the rest of the board can cover what is left after it.
 *
 * This replaced a two-pass search that looked at distinct faces, then at
 * repeats of a single face, and nothing else — so a move needing repeats of
 * *two* faces (2 + 2 + 3 for 7) was reported unplayable even though it was
 * legal. Tiles the player could have used were greyed out.
 */
export const getTilesIndexCombinations = (tiles, sum) => {
  if (sum <= 0) return []
  const counts = faceCounts(tiles)
  const playable = []
  for (const [face, count] of counts) {
    if (face > sum) continue
    const rest = new Map(counts)
    if (count === 1) rest.delete(face)
    else rest.set(face, count - 1)
    if (reachable(rest, sum - face)[sum - face]) playable.push(face)
  }
  return playable.sort((a, b) => a - b)
}

/**
 * Every distinct combination of faces that adds up to `target`, each listed
 * once however many tiles carry that face.
 *
 * Enumerating per tile instead produced 627,756 subsets for a roll of 12 on a
 * full nine-row board — 112ms of work behind a computed that reruns on every
 * render. Counting combinations rather than tiles keeps it in the dozens.
 */
export const combinationsSummingTo = (counts, target) => {
  if (target <= 0) return []
  const faces = [...counts.keys()].filter((f) => f <= target).sort((a, b) => a - b)
  const results = []
  const chosen = []
  const walk = (index, remaining) => {
    if (remaining === 0) {
      results.push([...chosen])
      return
    }
    if (index >= faces.length) return
    const face = faces[index]
    const most = Math.min(counts.get(face), Math.floor(remaining / face))
    for (let take = most; take >= 0; take--) {
      for (let i = 0; i < take; i++) chosen.push(face)
      walk(index + 1, remaining - face * take)
      for (let i = 0; i < take; i++) chosen.pop()
    }
  }
  walk(0, target)
  return results.sort((a, b) => a.length - b.length || a[0] - b[0])
}

/**
 * Sprinkle special tiles across a board.
 *
 * They change how a turn can be played, never how it is scored: a tile is
 * still worth its own face value when it is shut.
 */
export const seedSpecials = (tiles, { wild = 0, locked = 0, rng = Math.random } = {}) => {
  const pool = shuffle(
    tiles.flatMap((row, r) => row.map((_, c) => [r, c])),
    rng
  )
  let at = 0
  for (let i = 0; i < wild && at < pool.length; i++, at++) {
    const [r, c] = pool[at]
    tiles[r][c].kind = 'wild'
  }
  for (let i = 0; i < locked && at < pool.length; i++, at++) {
    const [r, c] = pool[at]
    tiles[r][c].kind = 'locked'
  }
  return tiles
}

/** Total face value of the tiles matching `predicate`, across every row. */
export const sumTilesWhere = (tiles, predicate) =>
  _sum(tiles.map((row) => _sum(filter(row, predicate).map((t) => t.index))))

export default {
  combinationsSummingTo,
  createGuid,
  createTiles,
  faceCounts,
  getTilesIndexCombinations,
  isMobile,
  moveTile,
  seedSpecials,
  shuffle,
  subsetsSummingTo,
  sumTilesWhere
}
