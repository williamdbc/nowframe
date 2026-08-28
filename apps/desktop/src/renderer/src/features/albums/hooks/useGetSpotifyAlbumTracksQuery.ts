import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'

import type { SpotifyAlbumTracklist } from '../../../../../contracts/nowframe-api'
import { spotifyAlbumQueryKeys } from '../queries/spotify-album-query-keys'
import { SpotifyAlbumService } from '../services/spotify-album-service'

export function useGetSpotifyAlbumTracksQuery(
  albumId: string | null,
  enabled: boolean
): UseQueryResult<SpotifyAlbumTracklist, Error> {
  return useQuery({
    queryKey: spotifyAlbumQueryKeys.tracks(albumId ?? 'pending'),
    queryFn: () => SpotifyAlbumService.getTracks(albumId!),
    enabled: Boolean(albumId) && enabled,
    retry: false,
    staleTime: 10 * 60_000
  })
}
