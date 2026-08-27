import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'

import { spotifyPlaybackQueryKeys } from '@/features/playback/queries/spotify-playback-query-keys'
import { SpotifyPlaybackService } from '@/features/playback/services/spotify-playback-service'
import type { PlaybackOptionCommand } from '@/features/playback/types/playback-option-command'
import type { PlaybackState } from '@/features/playback/types/playback-state'

interface PlaybackOptionMutationContext {
  previousPlayback: PlaybackState | null | undefined
}

function setPlaybackOption(command: PlaybackOptionCommand): Promise<void> {
  return command.type === 'shuffle'
    ? SpotifyPlaybackService.setShuffle(command.enabled)
    : SpotifyPlaybackService.setRepeatMode(command.repeatMode)
}

function optimisticallySetPlaybackOption(
  playback: PlaybackState | null | undefined,
  command: PlaybackOptionCommand
): PlaybackState | null | undefined {
  if (!playback) return playback

  return command.type === 'shuffle'
    ? { ...playback, shuffleEnabled: command.enabled }
    : { ...playback, repeatMode: command.repeatMode }
}

export function useSetSpotifyPlaybackOptionMutation(): UseMutationResult<
  void,
  Error,
  PlaybackOptionCommand,
  PlaybackOptionMutationContext
> {
  const queryClient = useQueryClient()
  const queryKey = spotifyPlaybackQueryKeys.current()

  return useMutation({
    mutationFn: setPlaybackOption,
    onMutate: async (command) => {
      await queryClient.cancelQueries({ queryKey })
      const previousPlayback = queryClient.getQueryData<PlaybackState | null>(queryKey)

      queryClient.setQueryData<PlaybackState | null>(queryKey, (playback) =>
        optimisticallySetPlaybackOption(playback, command)
      )

      return { previousPlayback }
    },
    onError: (_error, _command, context) => {
      queryClient.setQueryData(queryKey, context?.previousPlayback)
    }
  })
}
