import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useLyricsPlaybackPosition } from './useLyricsPlaybackPosition'

afterEach(() => {
  vi.useRealTimers()
})

describe('useLyricsPlaybackPosition', () => {
  it('advances the lyrics clock every 100 milliseconds while playback is active', () => {
    vi.useFakeTimers()
    vi.setSystemTime(1_000)

    const { result } = renderHook(() => useLyricsPlaybackPosition(5_000, true))
    expect(result.current).toBe(5_000)

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(result.current).toBe(5_100)
  })

  it('uses the reconciled Spotify position while playback is paused', () => {
    const { result, rerender } = renderHook(
      ({ positionMs }) => useLyricsPlaybackPosition(positionMs, false),
      { initialProps: { positionMs: 5_000 } }
    )

    rerender({ positionMs: 8_000 })
    expect(result.current).toBe(8_000)
  })
})
