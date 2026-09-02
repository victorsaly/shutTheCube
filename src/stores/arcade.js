import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useStatsStore } from '@/stores/stats'
import {
  claimSession,
  fetchBoard,
  forgetMe,
  readToken,
  rename,
  signIn,
  submitScore,
  whoAmI,
  writeToken
} from '@/services/arcade'

const PENDING_KEY = 'shutTheCube.pendingScore'

/**
 * Signing in navigates away to Google and comes back to a fresh page, which
 * throws away the finished game along with everything else. So a score offered
 * for posting is parked in storage first and posted once we are back.
 */
const parkScore = (result) => {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(result))
  } catch {
    // Without storage the score simply is not posted; the game is unaffected.
  }
}

const takeParkedScore = () => {
  try {
    const raw = localStorage.getItem(PENDING_KEY)
    localStorage.removeItem(PENDING_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * Who you are on the leaderboard, and what the leaderboard says.
 *
 * Signing in is entirely optional and buys exactly one thing: a name on the
 * daily board. Everything else about the game — every mode, every record, the
 * whole thing offline — works untouched without it.
 */
export const useArcadeStore = defineStore('arcade', () => {
  const token = ref(readToken())
  const player = ref(null)
  const board = ref(null)
  const loadingBoard = ref(false)
  /** The rank just earned, shown once on the result card. */
  const lastRank = ref(null)
  /**
   * Why the last post did not land, if it did not.
   *
   * Failing silently is what made "I played and nothing appeared" impossible
   * to tell apart from "the board is broken".
   */
  const postError = ref('')
  const busy = ref(false)
  const error = ref('')

  const signedIn = computed(() => Boolean(token.value && player.value))
  const name = computed(() => player.value?.name ?? '')

  /**
   * Pick up a session on load.
   *
   * Two cases: we have just come back from Google with a one-time code in the
   * URL, or we already had a token from a previous visit.
   */
  const restore = async () => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('auth')
    if (code) {
      // Tidy the URL first, so a refresh cannot try to spend the code twice
      // and so the code never lingers in history.
      params.delete('auth')
      const query = params.toString()
      window.history.replaceState(
        {},
        '',
        `${window.location.pathname}${query ? `?${query}` : ''}`
      )
      const claimed = await claimSession(code)
      if (claimed) {
        token.value = readToken()
        player.value = { name: claimed.name }
        // The score they signed in to post, if that is why they signed in.
        const parked = takeParkedScore()
        if (parked) await postScore(parked)
        // Anything played on this device before signing in goes up too.
        await postBacklog()
        return
      }
    }
    if (!token.value) return
    const me = await whoAmI(token.value)
    if (me) {
      player.value = me
      await postBacklog()
    } else if (!readToken()) {
      // whoAmI drops the stored token only on a real 401. Any other failure is
      // the network having a moment, and signing someone out for being offline
      // would break the very thing being offline-first is for.
      token.value = null
    } else {
      // Could not confirm who we are, but the session may well still be good:
      // keep it, and let the next post find out.
      player.value = player.value ?? { name: '' }
    }
  }

  /**
   * Begin signing in, optionally carrying a just-finished game with it, so
   * that "post this score" is one decision rather than sign in, come back,
   * and find the game gone.
   */
  const startSignIn = (pending = null) => {
    if (pending) parkScore(pending)
    signIn()
  }

  const signOut = () => {
    writeToken(null)
    token.value = null
    player.value = null
    lastRank.value = null
  }

  const setName = async (next) => {
    if (!token.value) return false
    busy.value = true
    error.value = ''
    const result = await rename(token.value, next)
    busy.value = false
    if (!result.ok) {
      error.value = result.error
      return false
    }
    player.value = { ...player.value, name: result.name }
    return true
  }

  /** Erase the account and every score behind it. Immediate, and final. */
  const deleteAccount = async () => {
    if (!token.value) return false
    busy.value = true
    const done = await forgetMe(token.value)
    busy.value = false
    if (done) signOut()
    return done
  }

  const loadBoard = async ({ mode, period }) => {
    loadingBoard.value = true
    board.value = await fetchBoard({ mode, period })
    loadingBoard.value = false
    return board.value
  }

  /**
   * Post any daily finished on this device that never reached the board —
   * played before signing in, or while the network was down.
   *
   * The seed and move list were kept alongside the local result, so these can
   * still be verified rather than taken on trust. Failures are silent: a
   * backlog that will not post is not something to interrupt anyone about.
   */
  const postBacklog = async () => {
    if (!token.value) return 0
    const stats = useStatsStore()
    let posted = 0
    for (const entry of stats.unpostedDailies()) {
      const result = await submitScore(token.value, {
        mode: entry.mode,
        period: entry.period,
        seed: entry.seed,
        score: entry.score,
        rolls: entry.rolls,
        won: entry.won,
        turns: entry.turns
      })
      // A refusal is marked done too, so a score the server will never accept
      // is not retried on every single sign-in for the next ninety days.
      stats.markPosted(entry.mode, entry.period)
      if (result?.ok) posted += 1
    }
    return posted
  }

  /**
   * Post a finished daily, if there is anything to post it with.
   *
   * Silently does nothing when signed out or when the game was not seeded —
   * this is called at the end of every game, and an unranked one is the
   * ordinary case rather than a problem.
   */
  const postScore = async (result) => {
    lastRank.value = null
    postError.value = ''
    if (!token.value || result?.seed == null || !result?.period) return null
    const posted = await submitScore(token.value, result)
    if (!posted) {
      postError.value = 'Could not reach the leaderboard. Your score is saved here.'
    }
    if (posted?.ok) {
      lastRank.value = posted.rank ?? null
      // Mark it done locally, or the backlog sweep would post it all over
      // again on the next sign-in.
      useStatsStore().markPosted(result.mode, result.period)
    }
    return posted
  }

  return {
    token,
    player,
    board,
    loadingBoard,
    lastRank,
    postError,
    busy,
    error,
    signedIn,
    name,
    restore,
    startSignIn,
    signOut,
    setName,
    deleteAccount,
    loadBoard,
    postScore,
    postBacklog
  }
})
