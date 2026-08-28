import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { LyricsService } from '../services/lyrics-service'
import { useGetLyricsQuery } from './useGetLyricsQuery'

const lyricsQuery = {
  albumName: 'Crazy World',
  artistName: 'Scorpions',
  durationMs: 312_000,
  trackName: 'Wind Of Change'
}

function createWrapper(): React.ComponentType<PropsWithChildren> {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return function TestQueryClientProvider({ children }: PropsWithChildren): React.JSX.Element {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useGetLyricsQuery', () => {
  it('loads lyrics when the Lyrics theme enables the query', async () => {
    vi.spyOn(LyricsService, 'get').mockResolvedValue(null)

    const { result } = renderHook(() => useGetLyricsQuery(lyricsQuery, true), {
      wrapper: createWrapper()
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(LyricsService.get).toHaveBeenCalledWith(lyricsQuery)
  })

  it('does not contact LRCLIB while another theme is active', () => {
    const getLyricsSpy = vi.spyOn(LyricsService, 'get')

    renderHook(() => useGetLyricsQuery(lyricsQuery, false), { wrapper: createWrapper() })

    expect(getLyricsSpy).not.toHaveBeenCalled()
  })
})
