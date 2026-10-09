import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'

import { spotifyPlaybackQueryKeys } from '@/features/playback/queries/spotify-playback-query-keys'
import { SpotifyPlaybackService } from '@/features/playback/services/spotify-playback-service'
import {
  clearPlaybackExpectation,
  expectPlayback
} from '@/features/playback/utils/playback-expectation'

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

      const committedVolumePercent = Math.min(100, Math.max(0, volumePercent))
      expectPlayback((playback) => playback.device.volumePercent === committedVolumePercent)

      return { previousPlayback }
    },
    onError: (_error, _volumePercent, context) => {
      clearPlaybackExpectation()
      queryClient.setQueryData(queryKey, context?.previousPlayback)
    }
  })
}
