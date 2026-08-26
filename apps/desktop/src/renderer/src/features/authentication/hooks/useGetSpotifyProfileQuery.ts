import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'

import { spotifyProfileQueryOptions } from '../queries/spotify-profile-query-options'
import { SpotifyAuthenticationService } from '../services/spotify-authentication-service'

type SpotifyProfile = Awaited<ReturnType<typeof SpotifyAuthenticationService.getProfile>>

export function useGetSpotifyProfileQuery(): UseQueryResult<SpotifyProfile, Error> {
  return useQuery(spotifyProfileQueryOptions())
}
