import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'

import { spotifySessionQueryKeys } from '../queries/spotify-session-query-keys'
import { SpotifyAuthenticationService } from '../services/spotify-authentication-service'

type SpotifySessionState = Awaited<ReturnType<typeof SpotifyAuthenticationService.login>>

export function useLoginWithSpotifyMutation(): UseMutationResult<SpotifySessionState, Error, void> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => SpotifyAuthenticationService.login(),
    onSuccess: (session) => queryClient.setQueryData(spotifySessionQueryKeys.state(), session)
  })
}
