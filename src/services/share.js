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
export const challengeUrl = (modeKey) => `${SITE_URL}/challenge/${encodeURIComponent(modeKey)}.html`

/**
 * One finished game as chat text.
 * { modeLabel, modeKey, score, max, rolls, won }
 */
export const scoreCard = ({ modeLabel, score, max, rolls, won }) => {
  const verdict = won ? `📦 BOX SHUT in ${rolls} rolls!` : `${score} / ${max} · ${rolls} rolls`
  return [
    `SHUT THE CUBE · ${modeLabel.toUpperCase()}`,
    '',
    won ? '🟩'.repeat(10) : barBlocks(score, max),
    verdict,
    '',
    'Think you can beat it?'
  ].join('\n')
}

/**
 * Hand the score to whatever the device shares with — WhatsApp, Messages,
 * anything else in the sheet. Desktop browsers without a share sheet fall
 * back to the clipboard. Returns 'shared' | 'copied' | 'cancelled'.
 */
export async function shareScore(result) {
  const text = scoreCard(result)
  const url = challengeUrl(result.modeKey)
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
