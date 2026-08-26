import { queryOptions } from '@tanstack/react-query'

import { SpotifyAuthenticationService } from '../services/spotify-authentication-service'
import { spotifyProfileQueryKeys } from './spotify-profile-query-keys'

type SpotifyProfile = Awaited<ReturnType<typeof SpotifyAuthenticationService.getProfile>>
type SpotifyProfileQueryKey = ReturnType<typeof spotifyProfileQueryKeys.current>
type SpotifyProfileQueryOptions = ReturnType<
  typeof queryOptions<SpotifyProfile, Error, SpotifyProfile, SpotifyProfileQueryKey>
>

export function spotifyProfileQueryOptions(): SpotifyProfileQueryOptions {
  return queryOptions<SpotifyProfile, Error, SpotifyProfile, SpotifyProfileQueryKey>({
    queryKey: spotifyProfileQueryKeys.current(),
    queryFn: () => SpotifyAuthenticationService.getProfile(),
    staleTime: 5 * 60 * 1000
  })
}
