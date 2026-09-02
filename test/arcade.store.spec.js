import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useArcadeStore } from '@/stores/arcade'
import { useStatsStore } from '@/stores/stats'

/**
 * The leaderboard is optional to the game, and these tests mostly pin that:
 * signed out, offline, or refused, nothing here may throw into the interface
 * or stop a game being played.
 */

const jsonResponse = (data, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data
})

let arcade

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  window.history.replaceState({}, '', '/')
  arcade = useArcadeStore()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('signing in', () => {
  it('trades a one-time code from the URL for a session', async () => {
    window.history.replaceState({}, '', '/?auth=handoff-code')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ token: 'tok', name: 'Victor' }))
    )

    await arcade.restore()

    expect(arcade.signedIn).toBe(true)
    expect(arcade.name).toBe('Victor')
    expect(localStorage.getItem('shutTheCube.session')).toBe('tok')
  })

  it('scrubs the code from the URL so it cannot be spent twice', async () => {
    window.history.replaceState({}, '', '/?auth=handoff-code&mode=medium')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ token: 'tok', name: 'Victor' }))
    )

    await arcade.restore()

    expect(window.location.search).not.toContain('auth=')
    // Anything else in the URL is left exactly as it was.
    expect(window.location.search).toContain('mode=medium')
  })

  it('resumes a session stored from a previous visit', async () => {
    localStorage.setItem('shutTheCube.session', 'existing')
    // The store reads storage when it is created, which already happened.
    arcade.token = 'existing'
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ id: 'p1', name: 'Ada' }))
    )

    await arcade.restore()

    expect(arcade.signedIn).toBe(true)
    expect(arcade.name).toBe('Ada')
  })

  it('drops a session the server no longer accepts', async () => {
    localStorage.setItem('shutTheCube.session', 'stale')
    arcade.token = 'stale'
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ error: 'sign in first' }, 401))
    )

    await arcade.restore()

    expect(arcade.signedIn).toBe(false)
    expect(localStorage.getItem('shutTheCube.session')).toBe(null)
  })

  it('keeps the session through a network outage', async () => {
    localStorage.setItem('shutTheCube.session', 'tok')
    arcade.token = 'tok'
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('offline')
      })
    )

    await expect(arcade.restore()).resolves.not.toThrow()
    // Being offline is not being signed out — the token is only dropped when
    // the server actually refuses it. Signing people out for losing signal
    // would break the very thing being offline-first is for.
    expect(arcade.token).toBe('tok')
    expect(localStorage.getItem('shutTheCube.session')).toBe('tok')
  })
})

describe('posting a score', () => {
  const daily = {
    mode: 'medium',
    period: '2026-09-02',
    seed: 1234,
    score: 300,
    rolls: 20,
    won: false,
    turns: [{ d: [4], e: null, m: [{ f: 4, n: 1, w: 4, k: 'normal' }] }]
  }

  it('does nothing at all when signed out', async () => {
    const fetcher = vi.fn()
    vi.stubGlobal('fetch', fetcher)

    expect(await arcade.postScore(daily)).toBe(null)
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('does nothing for an unseeded game, which cannot be verified', async () => {
    arcade.token = 'tok'
    const fetcher = vi.fn()
    vi.stubGlobal('fetch', fetcher)

    expect(await arcade.postScore({ ...daily, seed: null })).toBe(null)
    expect(await arcade.postScore({ ...daily, period: null })).toBe(null)
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('posts a seeded daily and keeps the rank it earned', async () => {
    arcade.token = 'tok'
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ ok: true, rank: 4 }))
    )

    await arcade.postScore(daily)

    expect(arcade.lastRank).toBe(4)
  })

  it('sends the game name along, so one board can serve every game', async () => {
    arcade.token = 'tok'
    const fetcher = vi.fn(async () => jsonResponse({ ok: true, rank: 1 }))
    vi.stubGlobal('fetch', fetcher)

    await arcade.postScore(daily)

    const body = JSON.parse(fetcher.mock.calls[0][1].body)
    expect(body.game).toBe('shutthecube')
    expect(body.seed).toBe(1234)
    expect(body.turns).toEqual([{ d: [4], e: null, m: [{ f: 4, n: 1, w: 4, k: 'normal' }] }])
  })

  it('swallows a refusal rather than interrupting the end of a game', async () => {
    arcade.token = 'tok'
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ error: 'that score does not check out' }, 422))
    )

    await expect(arcade.postScore(daily)).resolves.toBe(null)
    expect(arcade.lastRank).toBe(null)
  })
})

describe('the board', () => {
  it('reads as absent when it cannot be reached', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('offline')
      })
    )

    await arcade.loadBoard({ mode: 'medium', period: '2026-09-02' })

    expect(arcade.board).toBe(null)
    expect(arcade.loadingBoard).toBe(false)
  })

  it('keeps the entries it is given', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({ board: 'shutthecube:medium:2026-09-02', entries: [{ rank: 1, name: 'Ada', score: 405 }] })
      )
    )

    await arcade.loadBoard({ mode: 'medium', period: '2026-09-02' })

    expect(arcade.board.entries[0].name).toBe('Ada')
  })
})

describe('leaving', () => {
  it('signing out forgets the token but keeps the scores', async () => {
    localStorage.setItem('shutTheCube.session', 'tok')
    arcade.token = 'tok'
    arcade.player = { name: 'Ada' }

    arcade.signOut()

    expect(arcade.signedIn).toBe(false)
    expect(localStorage.getItem('shutTheCube.session')).toBe(null)
  })

  it('deleting clears the session once the server confirms', async () => {
    localStorage.setItem('shutTheCube.session', 'tok')
    arcade.token = 'tok'
    arcade.player = { name: 'Ada' }
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ ok: true }))
    )

    expect(await arcade.deleteAccount()).toBe(true)
    expect(arcade.signedIn).toBe(false)
    expect(localStorage.getItem('shutTheCube.session')).toBe(null)
  })
})

describe('the backlog', () => {
  const daily = {
    mode: 'medium',
    period: '2026-09-02',
    seed: 1234,
    score: 300,
    rolls: 20,
    won: false,
    turns: [{ d: [4], e: null, m: [{ f: 4, n: 1, w: 4, k: 'normal' }] }]
  }

  it('posts a daily played before signing in', async () => {
    // A finished daily sitting in local storage from before there was a session.
    const stats = useStatsStore()
    stats.recordDaily('medium', '2026-09-02', {
      score: 300,
      won: false,
      rolls: 20,
      seed: 1234,
      turns: [{ d: [4], e: null, m: [{ f: 4, n: 1, w: 4, k: 'normal' }] }]
    })
    arcade.token = 'tok'
    const fetcher = vi.fn(async () => jsonResponse({ ok: true, rank: 2 }))
    vi.stubGlobal('fetch', fetcher)

    expect(await arcade.postBacklog()).toBe(1)
    expect(JSON.parse(fetcher.mock.calls[0][1].body).seed).toBe(1234)
    // And it is not offered a second time.
    expect(stats.unpostedDailies()).toHaveLength(0)
  })

  it('ignores a daily with no proof behind it', async () => {
    const stats = useStatsStore()
    // No turns recorded, so there is nothing the server could check.
    stats.recordDaily('medium', '2026-09-02', { score: 300, won: false, rolls: 20 })
    arcade.token = 'tok'
    const fetcher = vi.fn()
    vi.stubGlobal('fetch', fetcher)

    expect(await arcade.postBacklog()).toBe(0)
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('stops retrying a score the server refuses', async () => {
    const stats = useStatsStore()
    stats.recordDaily('medium', '2026-09-02', {
      score: 300,
      won: false,
      rolls: 20,
      seed: 1234,
      turns: [{ d: [4], e: null, m: [{ f: 4, n: 1, w: 4, k: 'normal' }] }]
    })
    arcade.token = 'tok'
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ error: 'that score does not check out' }, 422))
    )

    expect(await arcade.postBacklog()).toBe(0)
    expect(stats.unpostedDailies()).toHaveLength(0)
  })

  it('does nothing when signed out', async () => {
    const fetcher = vi.fn()
    vi.stubGlobal('fetch', fetcher)
    expect(await arcade.postBacklog()).toBe(0)
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('does not queue a score it has just posted live', async () => {
    const stats = useStatsStore()
    stats.recordDaily('medium', '2026-09-02', {
      score: 300,
      won: false,
      rolls: 20,
      seed: 1234,
      turns: [{ d: [4], e: null, m: [{ f: 4, n: 1, w: 4, k: 'normal' }] }]
    })
    arcade.token = 'tok'
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ ok: true, rank: 1 }))
    )

    await arcade.postScore(daily)

    expect(stats.unpostedDailies()).toHaveLength(0)
  })
})
