import { queryOptions } from '@tanstack/react-query'

import { SpotifyAuthenticationService } from '../services/spotify-authentication-service'
import { spotifySessionQueryKeys } from './spotify-session-query-keys'

type SpotifySessionState = Awaited<ReturnType<typeof SpotifyAuthenticationService.getSession>>
type SpotifySessionQueryKey = ReturnType<typeof spotifySessionQueryKeys.state>
type SpotifySessionQueryOptions = ReturnType<
  typeof queryOptions<SpotifySessionState, Error, SpotifySessionState, SpotifySessionQueryKey>
>

export function spotifySessionQueryOptions(): SpotifySessionQueryOptions {
  return queryOptions<SpotifySessionState, Error, SpotifySessionState, SpotifySessionQueryKey>({
    queryKey: spotifySessionQueryKeys.state(),
    queryFn: () => SpotifyAuthenticationService.getSession(),
    staleTime: Number.POSITIVE_INFINITY
  })
}
