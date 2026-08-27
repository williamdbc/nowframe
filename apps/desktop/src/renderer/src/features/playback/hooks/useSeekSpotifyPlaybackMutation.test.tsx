import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { spotifyPlaybackQueryKeys } from '@/features/playback/queries/spotify-playback-query-keys'
import { SpotifyPlaybackService } from '@/features/playback/services/spotify-playback-service'
import type { PlaybackState } from '@/features/playback/types/playback-state'

import { useSeekSpotifyPlaybackMutation } from './useSeekSpotifyPlaybackMutation'

const playback: PlaybackState = {
  capabilities: {
    canPause: true,
    canResume: true,
    canSeek: true,
    canSetVolume: true,
    canSkipNext: true,
    canSkipPrevious: true
  },
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
    collectionName: 'Album',
    creatorNames: ['Artist'],
    durationMs: 120_000,
    id: 'track-id',
    imageUrl: null,
    title: 'Track',
    type: 'track'
  },
  progressMs: 30_000,
  synchronizedAt: 1_000
}

function createWrapper(queryClient: QueryClient) {
  return function TestQueryClientProvider({ children }: PropsWithChildren): React.JSX.Element {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useSeekSpotifyPlaybackMutation', () => {
  it('updates progress immediately and sends the selected position', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(5_000)
    vi.spyOn(SpotifyPlaybackService, 'seek').mockResolvedValue(undefined)
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')
    queryClient.setQueryData(spotifyPlaybackQueryKeys.current(), playback)
    const { result } = renderHook(() => useSeekSpotifyPlaybackMutation(), {
      wrapper: createWrapper(queryClient)
    })

    await act(() => result.current.mutateAsync(75_000))

    expect(SpotifyPlaybackService.seek).toHaveBeenCalledWith(75_000)
    expect(
      queryClient.getQueryData<PlaybackState>(spotifyPlaybackQueryKeys.current())
    ).toMatchObject({ progressMs: 75_000, synchronizedAt: 5_000 })
    expect(invalidateQueriesSpy).not.toHaveBeenCalled()
  })
})
