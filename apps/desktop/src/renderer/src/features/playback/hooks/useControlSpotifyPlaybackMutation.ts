import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'

import { spotifyPlaybackQueryKeys } from '@/features/playback/queries/spotify-playback-query-keys'
import { SpotifyPlaybackService } from '@/features/playback/services/spotify-playback-service'
import type { PlaybackCommand } from '@/features/playback/types/playback-command'
import { calculatePlaybackProgress } from '@/features/playback/utils/calculate-playback-progress'

type SpotifyPlayback = Awaited<ReturnType<typeof SpotifyPlaybackService.getCurrentPlayback>>

interface PlaybackMutationContext {
  previousPlayback: SpotifyPlayback | undefined
}

function executePlaybackCommand(command: PlaybackCommand): Promise<void> {
  switch (command) {
    case 'next':
      return SpotifyPlaybackService.skipToNext()
    case 'pause':
      return SpotifyPlaybackService.pause()
    case 'previous':
      return SpotifyPlaybackService.skipToPrevious()
    case 'resume':
      return SpotifyPlaybackService.resume()
  }
}

function optimisticallyUpdatePlayingState(
  playback: SpotifyPlayback | undefined,
  command: PlaybackCommand
): SpotifyPlayback | undefined {
  if (!playback || (command !== 'pause' && command !== 'resume')) return playback

  const now = Date.now()

  return {
    ...playback,
    isPlaying: command === 'resume',
    progressMs: calculatePlaybackProgress(playback, now),
    synchronizedAt: now
  }
}

export function useControlSpotifyPlaybackMutation(): UseMutationResult<
  void,
  Error,
  PlaybackCommand,
  PlaybackMutationContext
> {
  const queryClient = useQueryClient()
  const queryKey = spotifyPlaybackQueryKeys.current()

  return useMutation({
    mutationFn: executePlaybackCommand,
    onMutate: async (command) => {
      await queryClient.cancelQueries({ queryKey })
      const previousPlayback = queryClient.getQueryData<SpotifyPlayback>(queryKey)

      queryClient.setQueryData<SpotifyPlayback>(queryKey, (playback) =>
        optimisticallyUpdatePlayingState(playback, command)
      )

      return { previousPlayback }
    },
    onError: (_error, _command, context) => {
      queryClient.setQueryData(queryKey, context?.previousPlayback)
    }
  })
}
