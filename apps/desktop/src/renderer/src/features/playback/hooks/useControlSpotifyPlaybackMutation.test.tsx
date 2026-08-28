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
  item: {
    album: { id: 'album-id', uri: 'spotify:album:album-id' },
    collectionName: 'Album',
    creatorNames: ['Artist'],
    durationMs: 120_000,
    id: 'track-id',
    imageUrl: null,
    title: 'Track',
    type: 'track',
    uri: 'spotify:track:trackid'
  },
  progressMs: 30_000,
  repeatMode: 'off',
  shuffleEnabled: false,
  synchronizedAt: 1_000
}

const queuedItem: NonNullable<PlaybackState['item']> = {
  album: { id: 'queued-album-id', uri: 'spotify:album:queued-album-id' },
  collectionName: 'Queued Album',
  creatorNames: ['Queued Artist'],
  durationMs: 210_000,
  id: 'queued-track-id',
  imageUrl: null,
  title: 'Queued Track',
  type: 'track',
  uri: 'spotify:track:queuedtrackid'
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
  vi.useRealTimers()
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

  it('reconciles the metadata shortly after skipping to the next content', async () => {
    vi.useFakeTimers()
    const nextPlayback: PlaybackState = {
      ...playback,
      item: {
        album: { id: 'next-album-id', uri: 'spotify:album:next-album-id' },
        collectionName: 'Next Album',
        creatorNames: ['Next Artist'],
        durationMs: 180_000,
        id: 'next-track-id',
        imageUrl: null,
        title: 'Next Track',
        type: 'track',
        uri: 'spotify:track:nexttrackid'
      },
      progressMs: 800,
      synchronizedAt: 4_000
    }
    vi.spyOn(SpotifyPlaybackService, 'skipToNext').mockResolvedValue(undefined)
    const getCurrentPlaybackSpy = vi
      .spyOn(SpotifyPlaybackService, 'getCurrentPlayback')
      .mockResolvedValueOnce(playback)
      .mockResolvedValueOnce(playback)
      .mockResolvedValueOnce(nextPlayback)
    const queryClient = createQueryClient()
    queryClient.setQueryData(spotifyPlaybackQueryKeys.current(), playback)
    const { result } = renderHook(() => useControlSpotifyPlaybackMutation(), {
      wrapper: createWrapper(queryClient)
    })

    await act(() => result.current.mutateAsync('next'))
    expect(getCurrentPlaybackSpy).toHaveBeenCalledTimes(1)

    await act(() => vi.advanceTimersByTimeAsync(250))
    expect(getCurrentPlaybackSpy).toHaveBeenCalledTimes(2)

    await act(() => vi.advanceTimersByTimeAsync(500))
    expect(getCurrentPlaybackSpy).toHaveBeenCalledTimes(3)
    expect(queryClient.getQueryData(spotifyPlaybackQueryKeys.current())).toEqual(nextPlayback)

    await act(() => vi.advanceTimersByTimeAsync(1_000))
    expect(getCurrentPlaybackSpy).toHaveBeenCalledTimes(3)
  })

  it('limits reconciliation when Spotify keeps returning the previous content', async () => {
    vi.useFakeTimers()
    vi.spyOn(SpotifyPlaybackService, 'skipToPrevious').mockResolvedValue(undefined)
    const getCurrentPlaybackSpy = vi
      .spyOn(SpotifyPlaybackService, 'getCurrentPlayback')
      .mockResolvedValue(playback)
    const queryClient = createQueryClient()
    queryClient.setQueryData(spotifyPlaybackQueryKeys.current(), playback)
    const { result } = renderHook(() => useControlSpotifyPlaybackMutation(), {
      wrapper: createWrapper(queryClient)
    })

    await act(() => result.current.mutateAsync('previous'))
    await act(() => vi.advanceTimersByTimeAsync(2_000))

    const attemptsAfterLadder = getCurrentPlaybackSpy.mock.calls.length
    expect(attemptsAfterLadder).toBe(4)

    // O ladder é limitado: passado o último offset, nenhuma tentativa nova acontece.
    await act(() => vi.advanceTimersByTimeAsync(10_000))
    expect(getCurrentPlaybackSpy).toHaveBeenCalledTimes(attemptsAfterLadder)
  })

  it('advances the metadata immediately when the queued next content is known', async () => {
    vi.useFakeTimers()
    vi.spyOn(SpotifyPlaybackService, 'skipToNext').mockResolvedValue(undefined)
    const getCurrentPlaybackSpy = vi
      .spyOn(SpotifyPlaybackService, 'getCurrentPlayback')
      .mockResolvedValue(playback)
    const queryClient = createQueryClient()
    queryClient.setQueryData(spotifyPlaybackQueryKeys.current(), playback)
    queryClient.setQueryData(spotifyPlaybackQueryKeys.queue('track:track-id'), {
      items: [queuedItem]
    })
    const { result } = renderHook(() => useControlSpotifyPlaybackMutation(), {
      wrapper: createWrapper(queryClient)
    })

    await act(() => result.current.mutateAsync('next'))

    // A troca aconteceu sem depender de nenhuma consulta de reconciliação.
    expect(
      queryClient.getQueryData<PlaybackState>(spotifyPlaybackQueryKeys.current())
    ).toMatchObject({
      item: queuedItem,
      progressMs: 0
    })

    await act(() => vi.advanceTimersByTimeAsync(2_000))
    expect(getCurrentPlaybackSpy).toHaveBeenCalled()
  })

  it('corrects an optimistic guess when Spotify reports different content', async () => {
    vi.useFakeTimers()
    const actualNextPlayback: PlaybackState = {
      ...playback,
      item: { ...queuedItem, id: 'shuffled-track-id', title: 'Shuffled Track' },
      progressMs: 500
    }
    vi.spyOn(SpotifyPlaybackService, 'skipToNext').mockResolvedValue(undefined)
    vi.spyOn(SpotifyPlaybackService, 'getCurrentPlayback').mockResolvedValue(actualNextPlayback)
    const queryClient = createQueryClient()
    queryClient.setQueryData(spotifyPlaybackQueryKeys.current(), playback)
    queryClient.setQueryData(spotifyPlaybackQueryKeys.queue('track:track-id'), {
      items: [queuedItem]
    })
    const { result } = renderHook(() => useControlSpotifyPlaybackMutation(), {
      wrapper: createWrapper(queryClient)
    })

    await act(() => result.current.mutateAsync('next'))
    await act(() => vi.advanceTimersByTimeAsync(2_000))

    expect(queryClient.getQueryData(spotifyPlaybackQueryKeys.current())).toEqual(actualNextPlayback)
  })

  /**
   * Sem o `stateChangedAt`, avançar para a mesma faixa (repeat, ou a mesma música duas vezes
   * seguidas na fila) não é distinguível de uma resposta obsoleta: a chave de conteúdo é
   * igual e o progresso não regrediu o bastante.
   */
  it('detects a change to the same content through the Spotify state timestamp', async () => {
    vi.useFakeTimers()
    const previousPlayback = { ...playback, progressMs: 1_000, stateChangedAt: 111 }
    const restartedPlayback = { ...playback, progressMs: 200, stateChangedAt: 222 }
    vi.spyOn(SpotifyPlaybackService, 'skipToNext').mockResolvedValue(undefined)
    const getCurrentPlaybackSpy = vi
      .spyOn(SpotifyPlaybackService, 'getCurrentPlayback')
      .mockResolvedValue(restartedPlayback)
    const queryClient = createQueryClient()
    queryClient.setQueryData(spotifyPlaybackQueryKeys.current(), previousPlayback)
    const { result } = renderHook(() => useControlSpotifyPlaybackMutation(), {
      wrapper: createWrapper(queryClient)
    })

    await act(() => result.current.mutateAsync('next'))
    await act(() => vi.advanceTimersByTimeAsync(2_000))

    expect(queryClient.getQueryData(spotifyPlaybackQueryKeys.current())).toEqual(restartedPlayback)
    // Saiu na primeira tentativa, sem precisar percorrer o ladder inteiro.
    expect(getCurrentPlaybackSpy).toHaveBeenCalledTimes(1)
  })

  it('ignores a stale queue that still lists the current content', async () => {
    vi.useFakeTimers()
    vi.spyOn(SpotifyPlaybackService, 'skipToNext').mockResolvedValue(undefined)
    vi.spyOn(SpotifyPlaybackService, 'getCurrentPlayback').mockResolvedValue(playback)
    const queryClient = createQueryClient()
    queryClient.setQueryData(spotifyPlaybackQueryKeys.current(), playback)
    queryClient.setQueryData(spotifyPlaybackQueryKeys.queue('track:track-id'), {
      items: [playback.item!]
    })
    const { result } = renderHook(() => useControlSpotifyPlaybackMutation(), {
      wrapper: createWrapper(queryClient)
    })

    await act(() => result.current.mutateAsync('next'))

    // Nenhum palpite: os metadados seguem os do conteúdo atual até o servidor confirmar.
    expect(
      queryClient.getQueryData<PlaybackState>(spotifyPlaybackQueryKeys.current())?.item
    ).toEqual(playback.item)

    await act(() => vi.advanceTimersByTimeAsync(2_000))
  })
})
