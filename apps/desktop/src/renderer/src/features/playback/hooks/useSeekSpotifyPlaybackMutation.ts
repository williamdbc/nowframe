import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'

import { spotifyPlaybackQueryKeys } from '@/features/playback/queries/spotify-playback-query-keys'
import { SpotifyPlaybackService } from '@/features/playback/services/spotify-playback-service'

type SpotifyPlayback = Awaited<ReturnType<typeof SpotifyPlaybackService.getCurrentPlayback>>

interface SeekPlaybackMutationContext {
  previousPlayback: SpotifyPlayback | undefined
}

export function useSeekSpotifyPlaybackMutation(): UseMutationResult<
  void,
  Error,
  number,
  SeekPlaybackMutationContext
> {
  const queryClient = useQueryClient()
  const queryKey = spotifyPlaybackQueryKeys.current()

  return useMutation({
    mutationFn: (positionMs) => SpotifyPlaybackService.seek(positionMs),
    onMutate: async (positionMs) => {
      await queryClient.cancelQueries({ queryKey })
      const previousPlayback = queryClient.getQueryData<SpotifyPlayback>(queryKey)

      queryClient.setQueryData<SpotifyPlayback>(queryKey, (playback) => {
        if (!playback?.item) return playback

        return {
          ...playback,
          progressMs: Math.min(playback.item.durationMs, Math.max(0, positionMs)),
          synchronizedAt: Date.now()
        }
      })

      return { previousPlayback }
    },
    onError: (_error, _positionMs, context) => {
      queryClient.setQueryData(queryKey, context?.previousPlayback)
    }
  })
}
