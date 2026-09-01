import { afterEach, describe, expect, it } from 'vitest'
import { startAnalytics } from '../src/analytics.js'

const beacons = () =>
  document.querySelectorAll('script[src="https://static.cloudflareinsights.com/beacon.min.js"]')

afterEach(() => {
  document.head.innerHTML = ''
})

describe('analytics', () => {
  it('contacts nobody when no token is configured', () => {
    expect(startAnalytics(undefined)).toBe(null)
    expect(startAnalytics('')).toBe(null)
    expect(beacons()).toHaveLength(0)
  })

  it('loads the beacon when a token is configured', () => {
    const script = startAnalytics('test-token')
    expect(script).not.toBe(null)
    expect(beacons()).toHaveLength(1)
    expect(script.defer).toBe(true)
    expect(JSON.parse(script.dataset.cfBeacon)).toEqual({ token: 'test-token' })
  })

  it('loads it only once however often it is called', () => {
    startAnalytics('test-token')
    expect(startAnalytics('test-token')).toBe(null)
    expect(beacons()).toHaveLength(1)
  })

  it('sets no cookie and stores nothing itself', () => {
    const before = { cookie: document.cookie, storage: { ...localStorage } }
    startAnalytics('test-token')
    expect(document.cookie).toBe(before.cookie)
    expect({ ...localStorage }).toEqual(before.storage)
  })
})
