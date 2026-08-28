import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'

import { spotifyPlaybackQueryOptions } from '../queries/spotify-playback-query-options'
import { SpotifyPlaybackService } from '../services/spotify-playback-service'
import { useRefreshSpotifyPlaybackNearTrackEnd } from './useRefreshSpotifyPlaybackNearTrackEnd'

type SpotifyPlayback = Awaited<ReturnType<typeof SpotifyPlaybackService.getCurrentPlayback>>

export function useGetSpotifyPlaybackQuery(): UseQueryResult<SpotifyPlayback, Error> {
  const playbackQuery = useQuery(spotifyPlaybackQueryOptions())

  useRefreshSpotifyPlaybackNearTrackEnd(playbackQuery.data)

  return playbackQuery
}
