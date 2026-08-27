import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SpotifyAlbumService } from '../services/spotify-album-service'
import { useGetSpotifyAlbumTracksQuery } from './useGetSpotifyAlbumTracksQuery'

function createWrapper(): React.ComponentType<PropsWithChildren> {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return function TestQueryClientProvider({ children }: PropsWithChildren): React.JSX.Element {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useGetSpotifyAlbumTracksQuery', () => {
  it('loads album tracks when the Tracklist theme enables the query', async () => {
    vi.spyOn(SpotifyAlbumService, 'getTracks').mockResolvedValue({
      albumId: 'album-id',
      tracks: []
    })

    const { result } = renderHook(() => useGetSpotifyAlbumTracksQuery('album-id', true), {
      wrapper: createWrapper()
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(SpotifyAlbumService.getTracks).toHaveBeenCalledWith('album-id')
  })

  it('does not call Spotify while another theme is active', () => {
    const getTracksSpy = vi.spyOn(SpotifyAlbumService, 'getTracks')

    renderHook(() => useGetSpotifyAlbumTracksQuery('album-id', false), {
      wrapper: createWrapper()
    })

    expect(getTracksSpy).not.toHaveBeenCalled()
  })
})
