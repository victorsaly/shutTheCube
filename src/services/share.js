/**
 * Wordle-style shareable score cards. The row of blocks is the whole trick:
 * colour reads as a score at a glance in a chat, where a bare number reads
 * as nothing. The challenge link rides in `url`, not buried in the text, so
 * the target renders the game's own preview card.
 */

export const SITE_URL = 'https://shutthecube.com'

/** Ten blocks for the fraction of the board banked. */
export const barBlocks = (score, max) => {
  const filled = Math.round(Math.max(0, Math.min(1, max > 0 ? score / max : 0)) * 10)
  return '🟩'.repeat(filled) + '⬛'.repeat(10 - filled)
}

/**
 * The same game, on the same mode — what the recipient is being dared into.
 * Each mode's challenge page carries its own social card (og:image), so the
 * link previews the mode itself; the page redirects straight into the game.
 */
export const challengeUrl = (modeKey, { seed = null, day = null } = {}) => {
  const base = `${SITE_URL}/challenge/${encodeURIComponent(modeKey)}.html`
  const query = new URLSearchParams()
  // The seed is what makes this a challenge rather than a recommendation:
  // without it the recipient gets a different board and nothing to beat.
  if (seed !== null) query.set('s', String(seed))
  if (day !== null) query.set('d', String(day))
  const suffix = query.toString()
  return suffix ? `${base}?${suffix}` : base
}

/**
 * One finished game as chat text.
 * Solo: { modeLabel, modeKey, score, max, rolls, won }
 * Match: { match: true, modeLabel, modeKey, max, p1, p2, verdict }
 */
/**
 * The headline. A day number is what turns a card into a thread — everyone
 * comparing the same board on the same day, the way a crossword number does.
 */
const heading = ({ modeLabel, day }, suffix = '') =>
  [`SHUT THE CUBE`, day != null ? `#${day}` : null, modeLabel.toUpperCase(), suffix || null]
    .filter(Boolean)
    .join(' · ')

export const scoreCard = (result) => {
  if (result.match) {
    const line = ({ score, won }) =>
      `${won ? '🟩'.repeat(10) : barBlocks(score, result.max)} ${score}`
    return [
      heading(result, 'PASS & PLAY'),
      '',
      `P1 ${line(result.p1)}`,
      `P2 ${line(result.p2)}`,
      result.verdict,
      '',
      'Think you can beat it?'
    ].join('\n')
  }
  return soloCard(result)
}

const soloCard = (result) => {
  const { score, max, rolls, won, streak = 0 } = result
  const verdict = won ? `📦 BOX SHUT in ${rolls} rolls!` : `${score} / ${max} · ${rolls} rolls`
  return [
    heading(result),
    '',
    won ? '🟩'.repeat(10) : barBlocks(score, max),
    verdict,
    // A streak is only worth saying out loud once it is worth protecting.
    streak > 1 ? `🔥 ${streak} day streak` : null,
    '',
    'Think you can beat it?'
  ]
    .filter((line) => line !== null)
    .join('\n')
}

/**
 * Hand the score to whatever the device shares with — WhatsApp, Messages,
 * anything else in the sheet. Desktop browsers without a share sheet fall
 * back to the clipboard. Returns 'shared' | 'copied' | 'cancelled'.
 */
export async function shareScore(result) {
  const text = scoreCard(result)
  const url = challengeUrl(result.modeKey, { seed: result.seed ?? null, day: result.day ?? null })
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Shut The Cube', text, url })
      return 'shared'
    } catch {
      return 'cancelled' // user dismissed the sheet — don't silently copy instead
    }
  }
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`)
    return 'copied'
  } catch {
    return 'cancelled'
  }
}
