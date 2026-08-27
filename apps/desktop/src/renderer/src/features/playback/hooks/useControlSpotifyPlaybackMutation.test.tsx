import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { spotifyPlaybackQueryKeys } from '@/features/playback/queries/spotify-playback-query-keys'
import { SpotifyPlaybackService } from '@/features/playback/services/spotify-playback-service'
import type { PlaybackState } from '@/features/playback/types/playback-state'

import { useControlSpotifyPlaybackMutation } from './useControlSpotifyPlaybackMutation'

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

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false }
    }
  })
}

function createWrapper(queryClient: QueryClient) {
  return function TestQueryClientProvider({ children }: PropsWithChildren): React.JSX.Element {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useControlSpotifyPlaybackMutation', () => {
  it('updates pause immediately and keeps the server command as source of truth', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(3_500)
    vi.spyOn(SpotifyPlaybackService, 'pause').mockResolvedValue(undefined)
    const queryClient = createQueryClient()
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')
    queryClient.setQueryData(spotifyPlaybackQueryKeys.current(), playback)
    const { result } = renderHook(() => useControlSpotifyPlaybackMutation(), {
      wrapper: createWrapper(queryClient)
    })

    await act(() => result.current.mutateAsync('pause'))

    expect(SpotifyPlaybackService.pause).toHaveBeenCalledOnce()
    expect(
      queryClient.getQueryData<PlaybackState>(spotifyPlaybackQueryKeys.current())
    ).toMatchObject({
      isPlaying: false,
      progressMs: 32_500,
      synchronizedAt: 3_500
    })
    expect(invalidateQueriesSpy).not.toHaveBeenCalled()
  })

  it('restores the previous playback when a command fails', async () => {
    vi.spyOn(SpotifyPlaybackService, 'resume').mockRejectedValue(new Error('Spotify indisponível'))
    const pausedPlayback = { ...playback, isPlaying: false }
    const queryClient = createQueryClient()
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')
    queryClient.setQueryData(spotifyPlaybackQueryKeys.current(), pausedPlayback)
    const { result } = renderHook(() => useControlSpotifyPlaybackMutation(), {
      wrapper: createWrapper(queryClient)
    })

    await expect(act(() => result.current.mutateAsync('resume'))).rejects.toThrow(
      'Spotify indisponível'
    )
    expect(queryClient.getQueryData(spotifyPlaybackQueryKeys.current())).toEqual(pausedPlayback)
    expect(invalidateQueriesSpy).not.toHaveBeenCalled()
  })
})
