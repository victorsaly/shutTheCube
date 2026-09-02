/**
 * The leaderboard client.
 *
 * Every call here is optional to the game. The board is a place to put a score
 * after the fact, never something a turn waits on: if this is unreachable,
 * over quota, or blocked, the game plays exactly as it always has and the
 * board simply does not appear. That is why nothing in this file throws at the
 * caller — it returns null and lets the interface stay quiet.
 */

const BASE = import.meta.env.VITE_ARCADE_API ?? 'https://api.victorsaly.com'

const TOKEN_KEY = 'shutTheCube.session'
const GAME = 'shutthecube'

/** Sign-in survives a refresh, but is only ever a convenience. */
export const readToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export const writeToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // A session that cannot be remembered still works for this visit.
  }
}

/**
 * One request, with a short leash.
 *
 * A leaderboard that hangs is worse than one that is absent, so every call
 * gives up quickly and the interface treats that as "no board today".
 */
const call = async (path, { method = 'GET', body, token, timeout = 6000 } = {}) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const response = await fetch(`${BASE}${path}`, {
      method,
      // The board is usually read seconds after posting to it, and a cached
      // copy from before the post looks exactly like the post having failed.
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        ...(body ? { 'content-type': 'application/json' } : {}),
        ...(token ? { authorization: `Bearer ${token}` } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    })
    const data = await response.json().catch(() => null)
    return { ok: response.ok, status: response.status, data }
  } catch {
    return { ok: false, status: 0, data: null }
  } finally {
    clearTimeout(timer)
  }
}

/** Send the browser to Google. It comes back to this page with `?auth=`. */
export const signIn = () => {
  const back = `${window.location.origin}${window.location.pathname}`
  window.location.assign(`${BASE}/v1/auth/start?redirect=${encodeURIComponent(back)}`)
}

/**
 * Finish a sign-in that has just come back from Google.
 *
 * The callback hands over a one-time code rather than the session itself, so
 * no token ever sits in browser history or leaks through a referrer. The code
 * is traded once and the URL is tidied immediately.
 */
export const claimSession = async (code) => {
  const { ok, data } = await call('/v1/auth/claim', { method: 'POST', body: { code } })
  if (!ok || !data?.token) return null
  writeToken(data.token)
  return { name: data.name }
}

export const whoAmI = async (token) => {
  const { ok, status, data } = await call('/v1/me', { token })
  // A rejected token is a finished session, not a glitch: drop it rather than
  // leaving the player looking signed in but unable to post.
  if (status === 401) writeToken(null)
  return ok ? data : null
}

export const rename = async (token, name) => {
  const { ok, data } = await call('/v1/me', { method: 'PATCH', token, body: { name } })
  return ok ? { ok: true, name: data.name } : { ok: false, error: data?.error ?? 'Could not save that name.' }
}

export const forgetMe = async (token) => {
  const { ok } = await call('/v1/me', { method: 'DELETE', token })
  if (ok) writeToken(null)
  return ok
}

export const fetchBoard = async ({ mode, period, limit = 20 }) => {
  const query = new URLSearchParams({ game: GAME, mode, period, limit: String(limit) })
  const { ok, data } = await call(`/v1/board?${query}`)
  return ok ? data : null
}

/**
 * Post a finished daily.
 *
 * Only seeded games are ranked: an unseeded board cannot be rebuilt, so its
 * score cannot be checked, and an unverifiable entry on a public board is
 * worth less than no entry at all.
 */
export const submitScore = async (token, result) => {
  const { ok, data, status } = await call('/v1/score', {
    method: 'POST',
    token,
    body: { game: GAME, ...result }
  })
  if (status === 401) writeToken(null)
  return ok ? data : null
}

export const ARCADE_BASE = BASE
