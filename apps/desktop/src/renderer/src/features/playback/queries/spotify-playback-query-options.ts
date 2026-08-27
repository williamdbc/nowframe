import { queryOptions } from '@tanstack/react-query'

import { SpotifyPlaybackService } from '../services/spotify-playback-service'
import { spotifyPlaybackQueryKeys } from './spotify-playback-query-keys'

export const activePlaybackRefetchIntervalMs = 3_000
export const idlePlaybackRefetchIntervalMs = 10_000
export const failedPlaybackRefetchIntervalMs = 30_000

type SpotifyPlayback = Awaited<ReturnType<typeof SpotifyPlaybackService.getCurrentPlayback>>
type SpotifyPlaybackQueryKey = ReturnType<typeof spotifyPlaybackQueryKeys.current>
type SpotifyPlaybackQueryOptions = ReturnType<
  typeof queryOptions<SpotifyPlayback, Error, SpotifyPlayback, SpotifyPlaybackQueryKey>
>

export function getSpotifyPlaybackRefetchInterval(
  playback: SpotifyPlayback | undefined,
  hasError: boolean
): number {
  if (hasError) return failedPlaybackRefetchIntervalMs
  return playback?.isPlaying ? activePlaybackRefetchIntervalMs : idlePlaybackRefetchIntervalMs
}

export function spotifyPlaybackQueryOptions(): SpotifyPlaybackQueryOptions {
  return queryOptions<SpotifyPlayback, Error, SpotifyPlayback, SpotifyPlaybackQueryKey>({
    queryKey: spotifyPlaybackQueryKeys.current(),
    queryFn: () => SpotifyPlaybackService.getCurrentPlayback(),
    refetchInterval: (query) =>
      getSpotifyPlaybackRefetchInterval(query.state.data, Boolean(query.state.error)),
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: 'always',
    retry: false
  })
}
