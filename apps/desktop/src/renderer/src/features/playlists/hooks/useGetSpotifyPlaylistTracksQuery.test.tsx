import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SpotifyPlaylistService } from '../services/spotify-playlist-service'
import { useGetSpotifyPlaylistTracksQuery } from './useGetSpotifyPlaylistTracksQuery'

function createWrapper(): React.ComponentType<PropsWithChildren> {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return function TestQueryClientProvider({ children }: PropsWithChildren): React.JSX.Element {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useGetSpotifyPlaylistTracksQuery', () => {
  it('loads playlist tracks when its context is active', async () => {
    vi.spyOn(SpotifyPlaylistService, 'getTracks').mockResolvedValue({
      imageUrl: null,
      name: 'Road Trip',
      playlistId: 'playlist-id',
      tracks: []
    })

    const { result } = renderHook(() => useGetSpotifyPlaylistTracksQuery('playlist-id', true), {
      wrapper: createWrapper()
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(SpotifyPlaylistService.getTracks).toHaveBeenCalledWith('playlist-id')
  })

  it('does not call Spotify while the Tracklist theme is inactive', () => {
    const getTracksSpy = vi.spyOn(SpotifyPlaylistService, 'getTracks')

    renderHook(() => useGetSpotifyPlaylistTracksQuery('playlist-id', false), {
      wrapper: createWrapper()
    })

    expect(getTracksSpy).not.toHaveBeenCalled()
  })
})
