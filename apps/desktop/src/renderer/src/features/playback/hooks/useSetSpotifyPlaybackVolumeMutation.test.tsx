import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { spotifyPlaybackQueryKeys } from '@/features/playback/queries/spotify-playback-query-keys'
import { SpotifyPlaybackService } from '@/features/playback/services/spotify-playback-service'
import type { PlaybackState } from '@/features/playback/types/playback-state'

import { useSetSpotifyPlaybackVolumeMutation } from './useSetSpotifyPlaybackVolumeMutation'

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
  item: null,
  progressMs: 0,
  repeatMode: 'off',
  shuffleEnabled: false,
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

describe('useSetSpotifyPlaybackVolumeMutation', () => {
  it('updates volume immediately and restores it after an error', async () => {
    const setVolumeSpy = vi
      .spyOn(SpotifyPlaybackService, 'setVolume')
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('Spotify indisponível'))
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')
    queryClient.setQueryData(spotifyPlaybackQueryKeys.current(), playback)
    const { result } = renderHook(() => useSetSpotifyPlaybackVolumeMutation(), {
      wrapper: createWrapper(queryClient)
    })

    await act(() => result.current.mutateAsync(42))
    expect(
      queryClient.getQueryData<PlaybackState>(spotifyPlaybackQueryKeys.current())?.device
        .volumePercent
    ).toBe(42)
    expect(invalidateQueriesSpy).not.toHaveBeenCalled()

    await expect(act(() => result.current.mutateAsync(80))).rejects.toThrow('Spotify indisponível')
    expect(setVolumeSpy).toHaveBeenNthCalledWith(1, 42)
    expect(setVolumeSpy).toHaveBeenNthCalledWith(2, 80)
    expect(
      queryClient.getQueryData<PlaybackState>(spotifyPlaybackQueryKeys.current())?.device
        .volumePercent
    ).toBe(42)
    expect(invalidateQueriesSpy).not.toHaveBeenCalled()
  })
})
