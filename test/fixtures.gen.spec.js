import { describe, expect, it } from 'vitest'
import { writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { createPinia, setActivePinia } from 'pinia'
import { useGameStore } from '@/stores/game'

/**
 * Play real games with the real engine and write them out for the leaderboard
 * Worker to replay.
 *
 * This is the only test that can prove the Worker's replay agrees with the
 * game, because it is the game that produces the input. A rule change here
 * regenerates the fixtures, and arcade-api's suite fails until its copy of the
 * replay agrees again.
 */
const playOut = (mode, stamp) => {
  setActivePinia(createPinia())
  const g = useGameStore()
  g.newGame(mode, null, { daily: true, stamp })
  g.startGame()
  let guard = 0
  while (!g.isFinished && guard++ < 500) {
    if (g.state === 'isNext') {
      g.nextTurn()
      continue
    }
    let played = false
    outer: for (let r = 0; r < g.tiles.length; r++) {
      for (let c = 0; c < g.tiles[r].length; c++) {
        const t = g.tiles[r][c]
        if (t.isAvailable && !t.isTaken && !t.isInUse && g.playTile(r, c).length) {
          g.refreshAvailability(true)
          played = true
          break outer
        }
      }
    }
    if (!played) break
  }
  g.stopTimer()
  return {
    mode,
    seed: g.seed,
    score: g.sumTilesTaken,
    won: g.state === 'isWin',
    rolls: g.numberPlay,
    turns: JSON.parse(JSON.stringify(g.turns))
  }
}

describe('recorded games', () => {
  it('writes fixtures the leaderboard can be checked against', () => {
    const games = []
    for (const mode of ['beginner', 'medium', 'ninja']) {
      for (let n = 0; n < 8; n++) {
        games.push(playOut(mode, `2026-09-${String(2 + n).padStart(2, '0')}`))
      }
    }

    // Every game must have produced a usable record.
    for (const g of games) {
      expect(g.turns.length).toBeGreaterThan(0)
      expect(g.seed).toBeTypeOf('number')
      expect(g.score).toBeGreaterThanOrEqual(0)
      // Every turn records the roll it was played against.
      for (const t of g.turns) expect(t.d.length).toBeGreaterThan(0)
    }

    /*
     * The Worker lives in its own repository, so the fixtures are written
     * across to it when it happens to be checked out beside this one. On CI,
     * where it is not, this test still proves the games record cleanly.
     */
    const dir = resolve(process.cwd(), '../../arcade-api/test')
    if (existsSync(dir)) {
      writeFileSync(resolve(dir, 'fixtures.json'), `${JSON.stringify(games, null, 1)}\n`)
    }
  })
})
