import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'

import type { SpotifyLibraryItemState } from '../../../../../contracts/music-display-api'

import { spotifyLibraryQueryKeys } from '../queries/spotify-library-query-keys'
import { SpotifyLibraryService } from '../services/spotify-library-service'

export function useGetSpotifyLibraryItemQuery(
  uri: string | null
): UseQueryResult<SpotifyLibraryItemState, Error> {
  return useQuery({
    queryKey: spotifyLibraryQueryKeys.item(uri ?? 'pending'),
    queryFn: () => SpotifyLibraryService.getItemState(uri!),
    enabled: Boolean(uri),
    retry: false,
    staleTime: 60_000
  })
}
