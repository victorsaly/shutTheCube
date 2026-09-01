import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
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
        return
      }
    }
    if (!token.value) return
    const me = await whoAmI(token.value)
    if (me) player.value = me
    else token.value = null
  }

  const startSignIn = () => signIn()

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
   * Post a finished daily, if there is anything to post it with.
   *
   * Silently does nothing when signed out or when the game was not seeded —
   * this is called at the end of every game, and an unranked one is the
   * ordinary case rather than a problem.
   */
  const postScore = async (result) => {
    lastRank.value = null
    if (!token.value || result?.seed == null || !result?.period) return null
    const posted = await submitScore(token.value, result)
    if (posted?.ok) lastRank.value = posted.rank ?? null
    return posted
  }

  return {
    token,
    player,
    board,
    loadingBoard,
    lastRank,
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
    postScore
  }
})
