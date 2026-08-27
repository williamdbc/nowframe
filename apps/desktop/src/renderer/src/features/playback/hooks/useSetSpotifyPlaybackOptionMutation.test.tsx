import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { spotifyPlaybackQueryKeys } from '@/features/playback/queries/spotify-playback-query-keys'
import { SpotifyPlaybackService } from '@/features/playback/services/spotify-playback-service'
import type { PlaybackState } from '@/features/playback/types/playback-state'

import { useSetSpotifyPlaybackOptionMutation } from './useSetSpotifyPlaybackOptionMutation'

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

describe('useSetSpotifyPlaybackOptionMutation', () => {
  it('updates shuffle optimistically and rolls repeat back after an error', async () => {
    vi.spyOn(SpotifyPlaybackService, 'setShuffle').mockResolvedValue(undefined)
    vi.spyOn(SpotifyPlaybackService, 'setRepeatMode').mockRejectedValue(
      new Error('Spotify indisponível')
    )
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    queryClient.setQueryData(spotifyPlaybackQueryKeys.current(), playback)
    const { result } = renderHook(() => useSetSpotifyPlaybackOptionMutation(), {
      wrapper: createWrapper(queryClient)
    })

    await act(() => result.current.mutateAsync({ enabled: true, type: 'shuffle' }))
    expect(SpotifyPlaybackService.setShuffle).toHaveBeenCalledWith(true)
    expect(
      queryClient.getQueryData<PlaybackState>(spotifyPlaybackQueryKeys.current())?.shuffleEnabled
    ).toBe(true)

    await expect(
      act(() => result.current.mutateAsync({ repeatMode: 'track', type: 'repeat' }))
    ).rejects.toThrow('Spotify indisponível')
    expect(SpotifyPlaybackService.setRepeatMode).toHaveBeenCalledWith('track')
    expect(
      queryClient.getQueryData<PlaybackState>(spotifyPlaybackQueryKeys.current())?.repeatMode
    ).toBe('off')
  })
})
