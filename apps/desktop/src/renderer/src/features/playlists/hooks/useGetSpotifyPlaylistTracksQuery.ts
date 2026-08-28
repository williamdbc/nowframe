import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'

import type { SpotifyPlaylistTracklist } from '../../../../../contracts/nowframe-api'
import { spotifyPlaylistQueryKeys } from '../queries/spotify-playlist-query-keys'
import { SpotifyPlaylistService } from '../services/spotify-playlist-service'

export function useGetSpotifyPlaylistTracksQuery(
  playlistId: string | null,
  enabled: boolean
): UseQueryResult<SpotifyPlaylistTracklist, Error> {
  return useQuery({
    queryKey: spotifyPlaylistQueryKeys.tracks(playlistId ?? 'pending'),
    queryFn: () => SpotifyPlaylistService.getTracks(playlistId!),
    enabled: Boolean(playlistId) && enabled,
    retry: false,
    staleTime: 5 * 60_000
  })
}
