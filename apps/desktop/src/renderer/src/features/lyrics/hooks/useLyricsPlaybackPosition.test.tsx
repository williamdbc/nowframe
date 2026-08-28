import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { playbackClock } from '@/features/playback/utils/playback-clock'

import { useLyricsPlaybackPosition } from './useLyricsPlaybackPosition'

afterEach(() => {
  playbackClock.setAnchor(null)
})

describe('useLyricsPlaybackPosition', () => {
  it('follows the shared playback clock while playback is active', () => {
    playbackClock.setAnchor({
      durationMs: 200_000,
      isPlaying: true,
      itemKey: 'track:a',
      progressMs: 5_000,
      synchronizedAt: Date.now()
    })

    const { result } = renderHook(() => useLyricsPlaybackPosition(0, true))

    expect(result.current).toBeGreaterThanOrEqual(5_000)
    expect(result.current).toBeLessThan(6_000)
  })

  it('uses the reconciled Spotify position while playback is paused', () => {
    playbackClock.setAnchor({
      durationMs: 200_000,
      isPlaying: false,
      itemKey: 'track:a',
      progressMs: 5_000,
      synchronizedAt: Date.now()
    })

    const { result, rerender } = renderHook(
      ({ positionMs }) => useLyricsPlaybackPosition(positionMs, false),
      { initialProps: { positionMs: 5_000 } }
    )

    rerender({ positionMs: 8_000 })
    expect(result.current).toBe(8_000)
  })

  it('falls back to the position passed in when the clock has no anchor', () => {
    const { result } = renderHook(() => useLyricsPlaybackPosition(12_000, true))

    expect(result.current).toBe(12_000)
  })
})
