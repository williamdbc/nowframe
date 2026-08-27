import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SpotifyLibraryService } from '../services/spotify-library-service'
import { useGetSpotifyLibraryItemQuery } from './useGetSpotifyLibraryItemQuery'

function createWrapper(): React.ComponentType<PropsWithChildren> {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return function TestQueryClientProvider({ children }: PropsWithChildren): React.JSX.Element {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useGetSpotifyLibraryItemQuery', () => {
  it('loads the saved state for the current item URI', async () => {
    const uri = 'spotify:track:trackid'
    vi.spyOn(SpotifyLibraryService, 'getItemState').mockResolvedValue({ isSaved: true, uri })

    const { result } = renderHook(() => useGetSpotifyLibraryItemQuery(uri), {
      wrapper: createWrapper()
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(SpotifyLibraryService.getItemState).toHaveBeenCalledWith(uri)
    expect(result.current.data).toEqual({ isSaved: true, uri })
  })

  it('does not query the library without a supported item URI', () => {
    const getItemStateSpy = vi.spyOn(SpotifyLibraryService, 'getItemState')

    renderHook(() => useGetSpotifyLibraryItemQuery(null), { wrapper: createWrapper() })

    expect(getItemStateSpy).not.toHaveBeenCalled()
  })
})
