import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { spotifyLibraryQueryKeys } from '../queries/spotify-library-query-keys'
import { SpotifyLibraryService } from '../services/spotify-library-service'
import { useToggleSpotifyLibraryItemMutation } from './useToggleSpotifyLibraryItemMutation'

function createWrapper(queryClient: QueryClient) {
  return function TestQueryClientProvider({ children }: PropsWithChildren): React.JSX.Element {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useToggleSpotifyLibraryItemMutation', () => {
  it('updates the saved state optimistically and restores it after an error', async () => {
    const uri = 'spotify:track:trackid'
    vi.spyOn(SpotifyLibraryService, 'saveItem').mockResolvedValue(undefined)
    vi.spyOn(SpotifyLibraryService, 'removeItem').mockRejectedValue(
      new Error('Spotify indisponível')
    )
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    queryClient.setQueryData(spotifyLibraryQueryKeys.item(uri), { isSaved: false, uri })
    const { result } = renderHook(() => useToggleSpotifyLibraryItemMutation(), {
      wrapper: createWrapper(queryClient)
    })

    await act(() => result.current.mutateAsync({ shouldSave: true, uri }))
    expect(SpotifyLibraryService.saveItem).toHaveBeenCalledWith(uri)
    expect(queryClient.getQueryData(spotifyLibraryQueryKeys.item(uri))).toEqual({
      isSaved: true,
      uri
    })

    await expect(act(() => result.current.mutateAsync({ shouldSave: false, uri }))).rejects.toThrow(
      'Spotify indisponível'
    )
    expect(queryClient.getQueryData(spotifyLibraryQueryKeys.item(uri))).toEqual({
      isSaved: true,
      uri
    })
  })
})
