import { queryOptions } from '@tanstack/react-query'

import { SpotifyPlaybackService } from '../services/spotify-playback-service'
import { shouldDiscardPlayback } from '../utils/playback-expectation'
import { spotifyPlaybackQueryKeys } from './spotify-playback-query-keys'

export const activePlaybackRefetchIntervalMs = 1_500
export const idlePlaybackRefetchIntervalMs = 2_500
export const playbackWindowFocusFreshnessMs = 2_000

export const boundaryPlaybackRefetchIntervalMs = 300
export const boundaryPlaybackWindowMs = 2_500

export const failedPlaybackRefetchIntervalsMs = [2_000, 5_000, 15_000, 30_000] as const

type SpotifyPlayback = Awaited<ReturnType<typeof SpotifyPlaybackService.getCurrentPlayback>>
type SpotifyPlaybackQueryKey = ReturnType<typeof spotifyPlaybackQueryKeys.current>
type SpotifyPlaybackQueryOptions = ReturnType<
  typeof queryOptions<SpotifyPlayback, Error, SpotifyPlayback, SpotifyPlaybackQueryKey>
>

export function getSpotifyPlaybackRefetchInterval(
  playback: SpotifyPlayback | undefined,
  failureCount: number,
  now: number
): number {
  if (failureCount > 0) {
    const index = Math.min(failureCount - 1, failedPlaybackRefetchIntervalsMs.length - 1)
    return failedPlaybackRefetchIntervalsMs[index]
  }

  if (!playback?.isPlaying) return idlePlaybackRefetchIntervalMs

  if (!playback.item) return activePlaybackRefetchIntervalMs

  const elapsedMs = Math.max(0, now - playback.synchronizedAt)
  const remainingMs = playback.item.durationMs - (playback.progressMs + elapsedMs)

  return remainingMs <= boundaryPlaybackWindowMs
    ? boundaryPlaybackRefetchIntervalMs
    : activePlaybackRefetchIntervalMs
}

export function shouldRefetchPlaybackOnWindowFocus(dataUpdatedAt: number, now: number): boolean {
  return now - dataUpdatedAt >= playbackWindowFocusFreshnessMs
}

export function keepPlaybackWhenResponseIsStale(
  previousPlayback: unknown,
  nextPlayback: unknown
): unknown {
  if (previousPlayback === undefined) return nextPlayback

  return shouldDiscardPlayback(nextPlayback as SpotifyPlayback) ? previousPlayback : nextPlayback
}

export function spotifyPlaybackQueryOptions(): SpotifyPlaybackQueryOptions {
  return queryOptions<SpotifyPlayback, Error, SpotifyPlayback, SpotifyPlaybackQueryKey>({
    queryKey: spotifyPlaybackQueryKeys.current(),
    queryFn: () => SpotifyPlaybackService.getCurrentPlayback(),
    refetchInterval: (query) =>
      getSpotifyPlaybackRefetchInterval(
        query.state.data,
        query.state.fetchFailureCount,
        Date.now()
      ),
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: (query) =>
      shouldRefetchPlaybackOnWindowFocus(query.state.dataUpdatedAt, Date.now()),
    retry: false,
    structuralSharing: keepPlaybackWhenResponseIsStale
  })
}
