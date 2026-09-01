/**
 * The three difficulty modes.
 *
 * The 2018 build shipped a Beginner / Medium / Ninja menu in which Medium and
 * Ninja both called `setGame(9)` — they were byte-identical. These give each
 * one an actual rule of its own.
 */
export const MODES = {
  beginner: {
    key: 'beginner',
    label: 'Beginner',
    blurb: 'One row. Classic Shut The Box.',
    rows: 1,
    /** Seconds allowed per turn; 0 for untimed. */
    turnSeconds: 0,
    /**
     * The traditional rule: once nothing above a 6 is left, you may roll a
     * single die. The original dice model already carried an `isAvailable`
     * flag per die for this, but nothing ever set it.
     */
    allowsSingleDie: true,
    /** Whether a played tile also claims matching faces in adjacent rows. */
    allowsRuns: false,
    /** Special tiles and between-turn events. Beginner stays pure classic. */
    hasSurprises: false
  },
  medium: {
    key: 'medium',
    label: 'Medium',
    blurb: 'Nine rows. Matching columns collapse together for a bonus.',
    rows: 9,
    turnSeconds: 0,
    allowsSingleDie: false,
    allowsRuns: true,
    hasSurprises: true
  },
  ninja: {
    key: 'ninja',
    label: 'Ninja',
    blurb: 'Nine rows against the clock. 30 seconds a turn.',
    rows: 9,
    turnSeconds: 30,
    allowsSingleDie: false,
    allowsRuns: true,
    hasSurprises: true
  }
}

/** Named for the size of a run, so the board can call one out. */
export const RUN_NAMES = { 2: 'Double', 3: 'Triple', 4: 'Quad', 5: 'Five!', 6: 'Six!!' }
export const runName = (size) => RUN_NAMES[size] ?? (size > 6 ? `${size} in a row!!!` : '')

/**
 * Special tiles, seeded into the nine-row boards.
 * Neither changes how a game is scored: a tile is still worth its face value.
 */
export const SPECIALS = {
  wild: { key: 'wild', mark: '★', label: 'Wild — counts as whatever you still need' },
  locked: { key: 'locked', mark: '◆', label: 'Locked — only plays alone, matching the whole roll' }
}

/** Things that can happen between turns. */
export const EVENTS = {
  thirdDie: { key: 'thirdDie', title: 'Lucky third die', detail: 'One extra die this turn.' },
  reshuffle: { key: 'reshuffle', title: 'Reshuffle', detail: 'The rows have been shuffled.' },
  wildDrop: { key: 'wildDrop', title: 'Wild drop', detail: 'A tile turned wild.' }
}
export const EVENT_LIST = Object.values(EVENTS)

export const MODE_LIST = Object.values(MODES)

export const modeFor = (key) => MODES[key] ?? MODES.medium
