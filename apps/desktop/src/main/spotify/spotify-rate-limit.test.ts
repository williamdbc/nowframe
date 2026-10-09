import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  getRateLimitDelayMs,
  getRateLimitRemainingMs,
  isRateLimited,
  noteRateLimited,
  noteRequestSucceeded,
  resetRateLimitState
} from './spotify-rate-limit'

afterEach(() => {
  resetRateLimitState()
  vi.restoreAllMocks()
})

describe('getRateLimitDelayMs', () => {
  it('honours the Retry-After header when it is usable', () => {
    expect(getRateLimitDelayMs('15', 0)).toBe(15_000)
    expect(getRateLimitDelayMs('15', 3)).toBe(15_000)
  })

  it('grows the fallback per attempt instead of assuming thirty seconds', () => {
    expect(getRateLimitDelayMs(null, 0)).toBe(2_000)
    expect(getRateLimitDelayMs(null, 1)).toBe(5_000)
    expect(getRateLimitDelayMs(null, 2)).toBe(15_000)
  })

  it('caps the fallback', () => {
    expect(getRateLimitDelayMs(null, 99)).toBe(30_000)
  })

  it('ignores a malformed Retry-After', () => {
    expect(getRateLimitDelayMs('soon', 0)).toBe(2_000)
    expect(getRateLimitDelayMs('-5', 0)).toBe(2_000)
  })
})

describe('rate limit window', () => {
  it('holds requests until the window passes', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000_000)
    noteRateLimited('10')

    expect(isRateLimited()).toBe(true)
    expect(getRateLimitRemainingMs()).toBe(10_000)

    vi.spyOn(Date, 'now').mockReturnValue(1_010_001)
    expect(isRateLimited()).toBe(false)
    expect(getRateLimitRemainingMs()).toBe(0)
  })

  it('keeps the Retry-After window even when another request succeeds', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000_000)
    noteRateLimited(null)
    noteRateLimited(null)
    expect(isRateLimited()).toBe(true)

    noteRequestSucceeded()
    expect(isRateLimited()).toBe(true)

    vi.spyOn(Date, 'now').mockReturnValue(1_005_001)
    noteRequestSucceeded()
    expect(isRateLimited()).toBe(false)

    noteRateLimited(null)
    vi.spyOn(Date, 'now').mockReturnValue(1_007_002)
    expect(isRateLimited()).toBe(false)
  })

  it('never shortens an active Retry-After window', () => {
    vi.spyOn(Date, 'now').mockReturnValue(2_000_000)
    noteRateLimited('30')

    vi.spyOn(Date, 'now').mockReturnValue(2_001_000)
    const window = noteRateLimited('5')

    expect(window.retryAt).toBe(2_030_000)
    expect(window.delayMs).toBe(29_000)
  })
})
