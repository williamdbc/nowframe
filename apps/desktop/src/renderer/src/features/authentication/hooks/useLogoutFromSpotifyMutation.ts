import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'

import { spotifyProfileQueryKeys } from '../queries/spotify-profile-query-keys'
import { spotifySessionQueryKeys } from '../queries/spotify-session-query-keys'
import { SpotifyAuthenticationService } from '../services/spotify-authentication-service'

type SpotifySessionState = Awaited<ReturnType<typeof SpotifyAuthenticationService.logout>>

export function useLogoutFromSpotifyMutation(): UseMutationResult<
  SpotifySessionState,
  Error,
  void
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => SpotifyAuthenticationService.logout(),
    onSuccess: (session) => {
      queryClient.removeQueries({ queryKey: spotifyProfileQueryKeys.all })
      queryClient.setQueryData(spotifySessionQueryKeys.state(), session)
    }
  })
}
