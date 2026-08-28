import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { spotifyPlaybackQueryKeys } from '../queries/spotify-playback-query-keys'
import type { PlaybackState } from '../types/playback-state'
import {
  getPlaybackEndRefreshDelay,
  playbackEndRefreshGraceMs,
  useRefreshSpotifyPlaybackNearTrackEnd
} from './useRefreshSpotifyPlaybackNearTrackEnd'

const playback: PlaybackState = {
  capabilities: {
    canPause: true,
    canResume: true,
    canSeek: true,
    canSetVolume: true,
    canSkipNext: true,
    canSkipPrevious: true,
    canToggleRepeat: true,
    canToggleShuffle: true
  },
  context: null,
  device: {
    id: 'device-id',
    isRestricted: false,
    name: 'MacBook Pro',
    supportsVolume: true,
    type: 'Computer',
    volumePercent: 64
  },
  isPlaying: true,
  item: {
    album: { id: 'album-id', uri: 'spotify:album:album-id' },
    collectionName: 'Album',
    creatorNames: ['Artist'],
    durationMs: 10_000,
    id: 'track-id',
    imageUrl: null,
    title: 'Track',
    type: 'track',
    uri: 'spotify:track:track-id'
  },
  progressMs: 9_000,
  repeatMode: 'off',
  shuffleEnabled: false,
  synchronizedAt: 1_000
}

function createWrapper(queryClient: QueryClient) {
  return function TestQueryClientProvider({ children }: PropsWithChildren): React.JSX.Element {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(1_000)
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('getPlaybackEndRefreshDelay', () => {
  it('targets the expected end of the current track with a short grace period', () => {
    expect(getPlaybackEndRefreshDelay(playback, Date.now())).toBe(1_000 + playbackEndRefreshGraceMs)
  })

  it('does not schedule a refresh without active playback', () => {
    expect(getPlaybackEndRefreshDelay({ ...playback, isPlaying: false }, Date.now())).toBeNull()
    expect(getPlaybackEndRefreshDelay(null, Date.now())).toBeNull()
  })
})

describe('useRefreshSpotifyPlaybackNearTrackEnd', () => {
  it('refetches playback as soon as the current track is expected to finish', () => {
    const queryClient = new QueryClient()
    const refetchQueriesSpy = vi.spyOn(queryClient, 'refetchQueries').mockResolvedValue(undefined)

    renderHook(() => useRefreshSpotifyPlaybackNearTrackEnd(playback), {
      wrapper: createWrapper(queryClient)
    })

    act(() => vi.advanceTimersByTime(1_000 + playbackEndRefreshGraceMs - 1))
    expect(refetchQueriesSpy).not.toHaveBeenCalled()

    act(() => vi.advanceTimersByTime(1))
    expect(refetchQueriesSpy).toHaveBeenCalledWith({
      queryKey: spotifyPlaybackQueryKeys.current(),
      type: 'active'
    })
  })

  it('cancels the predicted refresh when playback becomes paused', () => {
    const queryClient = new QueryClient()
    const refetchQueriesSpy = vi.spyOn(queryClient, 'refetchQueries').mockResolvedValue(undefined)
    const { rerender } = renderHook(
      ({ currentPlayback }) => useRefreshSpotifyPlaybackNearTrackEnd(currentPlayback),
      {
        initialProps: { currentPlayback: playback },
        wrapper: createWrapper(queryClient)
      }
    )

    rerender({ currentPlayback: { ...playback, isPlaying: false } })
    act(() => vi.runAllTimers())

    expect(refetchQueriesSpy).not.toHaveBeenCalled()
  })
})
