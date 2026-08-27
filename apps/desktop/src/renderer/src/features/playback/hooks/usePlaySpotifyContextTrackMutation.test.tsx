import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { spotifyPlaybackQueryKeys } from '../queries/spotify-playback-query-keys'
import { SpotifyPlaybackService } from '../services/spotify-playback-service'
import type { PlaybackState } from '../types/playback-state'
import { usePlaySpotifyContextTrackMutation } from './usePlaySpotifyContextTrackMutation'

function createWrapper(queryClient: QueryClient) {
  return function TestQueryClientProvider({ children }: PropsWithChildren): React.JSX.Element {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

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
  context: { id: 'playlist-id', type: 'playlist', uri: 'spotify:playlist:playlist-id' },
  device: {
    id: 'device-id',
    isRestricted: false,
    name: 'MacBook Pro',
    supportsVolume: true,
    type: 'Computer',
    volumePercent: 50
  },
  isPlaying: true,
  item: {
    album: { id: 'album-id', uri: 'spotify:album:album-id' },
    collectionName: 'Album',
    creatorNames: ['Artist'],
    durationMs: 180_000,
    id: 'track-1',
    imageUrl: 'https://i.scdn.co/image/track-1',
    title: 'First track',
    type: 'track',
    uri: 'spotify:track:track-1'
  },
  progressMs: 50_000,
  repeatMode: 'off',
  shuffleEnabled: false,
  synchronizedAt: 1_000
}

const selectedTrack = {
  creatorNames: ['Artist'],
  discNumber: 1,
  durationMs: 210_000,
  id: 'track-2',
  imageUrl: 'https://i.scdn.co/image/track-2',
  isPlayable: true,
  position: 7,
  title: 'Second track',
  trackNumber: 2,
  uri: 'spotify:track:track-2'
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('usePlaySpotifyContextTrackMutation', () => {
  it('starts the selected playlist position and updates the player immediately', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(2_000)
    vi.spyOn(SpotifyPlaybackService, 'playContextTrack').mockResolvedValue(undefined)
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    queryClient.setQueryData(spotifyPlaybackQueryKeys.current(), playback)
    const { result } = renderHook(() => usePlaySpotifyContextTrackMutation(), {
      wrapper: createWrapper(queryClient)
    })

    await act(() =>
      result.current.mutateAsync({
        contextUri: 'spotify:playlist:playlist-id',
        track: selectedTrack
      })
    )

    expect(SpotifyPlaybackService.playContextTrack).toHaveBeenCalledWith(
      'spotify:playlist:playlist-id',
      7
    )
    expect(
      queryClient.getQueryData<PlaybackState>(spotifyPlaybackQueryKeys.current())
    ).toMatchObject({
      isPlaying: true,
      progressMs: 0,
      synchronizedAt: 2_000,
      item: {
        id: 'track-2',
        imageUrl: 'https://i.scdn.co/image/track-2',
        title: 'Second track',
        uri: 'spotify:track:track-2'
      }
    })
  })
})
