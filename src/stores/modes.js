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
    allowsRuns: false
  },
  medium: {
    key: 'medium',
    label: 'Medium',
    blurb: 'Nine rows. Matching columns collapse together for a bonus.',
    rows: 9,
    turnSeconds: 0,
    allowsSingleDie: false,
    allowsRuns: true
  },
  ninja: {
    key: 'ninja',
    label: 'Ninja',
    blurb: 'Nine rows against the clock. 30 seconds a turn.',
    rows: 9,
    turnSeconds: 30,
    allowsSingleDie: false,
    allowsRuns: true
  }
}

export const MODE_LIST = Object.values(MODES)

export const modeFor = (key) => MODES[key] ?? MODES.medium
