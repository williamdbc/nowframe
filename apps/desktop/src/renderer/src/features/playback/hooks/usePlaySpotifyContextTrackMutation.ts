import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'

import { spotifyPlaybackQueryKeys } from '../queries/spotify-playback-query-keys'
import { SpotifyPlaybackService } from '../services/spotify-playback-service'
import type { PlayContextTrackMutationVariables } from '../types/play-context-track-mutation-variables'

type SpotifyPlayback = Awaited<ReturnType<typeof SpotifyPlaybackService.getCurrentPlayback>>

interface PlayContextTrackMutationContext {
  previousPlayback: SpotifyPlayback | undefined
}

export function usePlaySpotifyContextTrackMutation(): UseMutationResult<
  void,
  Error,
  PlayContextTrackMutationVariables,
  PlayContextTrackMutationContext
> {
  const queryClient = useQueryClient()
  const queryKey = spotifyPlaybackQueryKeys.current()

  return useMutation({
    mutationFn: ({ contextUri, track }) =>
      SpotifyPlaybackService.playContextTrack(contextUri, track.position),
    onMutate: async ({ track }) => {
      await queryClient.cancelQueries({ queryKey })
      const previousPlayback = queryClient.getQueryData<SpotifyPlayback>(queryKey)

      queryClient.setQueryData<SpotifyPlayback>(queryKey, (playback) => {
        if (!playback?.item) return playback

        return {
          ...playback,
          isPlaying: true,
          progressMs: 0,
          synchronizedAt: Date.now(),
          item: {
            ...playback.item,
            creatorNames: track.creatorNames,
            durationMs: track.durationMs,
            id: track.id,
            imageUrl: track.imageUrl ?? playback.item.imageUrl,
            title: track.title,
            type: 'track',
            uri: track.uri
          }
        }
      })

      return { previousPlayback }
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(queryKey, context?.previousPlayback)
    }
  })
}
