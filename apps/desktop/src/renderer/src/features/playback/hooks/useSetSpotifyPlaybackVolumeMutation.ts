import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'

import { spotifyPlaybackQueryKeys } from '@/features/playback/queries/spotify-playback-query-keys'
import { SpotifyPlaybackService } from '@/features/playback/services/spotify-playback-service'

type SpotifyPlayback = Awaited<ReturnType<typeof SpotifyPlaybackService.getCurrentPlayback>>

interface SetPlaybackVolumeMutationContext {
  previousPlayback: SpotifyPlayback | undefined
}

export function useSetSpotifyPlaybackVolumeMutation(): UseMutationResult<
  void,
  Error,
  number,
  SetPlaybackVolumeMutationContext
> {
  const queryClient = useQueryClient()
  const queryKey = spotifyPlaybackQueryKeys.current()

  return useMutation({
    mutationFn: (volumePercent) => SpotifyPlaybackService.setVolume(volumePercent),
    onMutate: async (volumePercent) => {
      await queryClient.cancelQueries({ queryKey })
      const previousPlayback = queryClient.getQueryData<SpotifyPlayback>(queryKey)

      queryClient.setQueryData<SpotifyPlayback>(queryKey, (playback) => {
        if (!playback) return playback

        return {
          ...playback,
          device: {
            ...playback.device,
            volumePercent: Math.min(100, Math.max(0, volumePercent))
          }
        }
      })

      return { previousPlayback }
    },
    onError: (_error, _volumePercent, context) => {
      queryClient.setQueryData(queryKey, context?.previousPlayback)
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey })
    }
  })
}
