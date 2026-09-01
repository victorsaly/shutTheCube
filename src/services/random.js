/**
 * Deterministic randomness, so a board can be *shared* rather than described.
 *
 * The daily challenge and a shared challenge link are the same mechanism: a
 * seed goes in, and an identical board with an identical run of dice comes
 * out. Until this existed, "think you can beat it?" dealt the recipient a
 * different board — there was nothing to beat.
 *
 * The generator is the one Delulu Beats already seeds its daily with, so the
 * two games agree on what a day is and what a seed does.
 */

/** Mulberry32: 32 bits of state, fast, and far better than dice need. */
export const mulberry32 = (seed) => {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** xfnv1a: any string to a well-mixed 32-bit seed. */
export const seedFrom = (text) => {
  let h = 2166136261
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h ^ (h >>> 16)) >>> 0
}

/**
 * Today, as the player's own calendar sees it.
 *
 * Local rather than UTC on purpose: a daily that turns over at local midnight
 * is the one people expect, and it is what Delulu Beats already does. The
 * cost is that two players in different zones can be on different boards for
 * a few hours; the shared link carries its own seed, so a direct challenge is
 * unaffected either way.
 */
export const todayStamp = (date = new Date()) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-')

/** The first daily. Day numbers on a shared card count from here. */
export const DAILY_EPOCH = '2026-09-01'

const partsOf = (stamp) => stamp.split('-').map(Number)

/** Whole days between two stamps, calendar-wise and free of DST drift. */
const daysBetween = (from, to) => {
  const [ay, am, ad] = partsOf(from)
  const [by, bm, bd] = partsOf(to)
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000)
}

/** Which daily this is, counting the epoch as #1 — the number on the card. */
export const dayNumber = (stamp = todayStamp()) => daysBetween(DAILY_EPOCH, stamp) + 1

/** Move a stamp by whole days, staying on the local calendar. */
export const shiftStamp = (stamp, delta) => {
  const [y, m, d] = partsOf(stamp)
  return todayStamp(new Date(y, m - 1, d + delta))
}

/**
 * The seed for one mode's board on one day. Namespaced so that the same date
 * gives each mode a board of its own.
 */
export const dailySeed = (modeKey, stamp = todayStamp()) =>
  seedFrom(`shutthecube:${stamp}:${modeKey}`)

/**
 * Consecutive days played, ending today or yesterday.
 *
 * Yesterday still counts so that a streak is not lost simply because today's
 * game has not been played yet — the streak is only broken by a whole day
 * going by.
 */
export const streakOf = (days, today = todayStamp()) => {
  const seen = new Set(days)
  let cursor = seen.has(today) ? today : shiftStamp(today, -1)
  let count = 0
  while (seen.has(cursor)) {
    count += 1
    cursor = shiftStamp(cursor, -1)
  }
  return count
}

/** Seconds until the next local midnight, for the countdown on the menu. */
export const secondsUntilTomorrow = (now = new Date()) => {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return Math.max(0, Math.floor((next - now) / 1000))
}

export default {
  DAILY_EPOCH,
  dailySeed,
  dayNumber,
  mulberry32,
  secondsUntilTomorrow,
  seedFrom,
  shiftStamp,
  streakOf,
  todayStamp
}
