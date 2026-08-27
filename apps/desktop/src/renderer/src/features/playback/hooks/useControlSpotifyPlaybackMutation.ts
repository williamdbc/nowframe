import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { QueryClient, UseMutationResult } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

import { spotifyPlaybackQueryKeys } from '@/features/playback/queries/spotify-playback-query-keys'
import { SpotifyPlaybackService } from '@/features/playback/services/spotify-playback-service'
import type { PlaybackCommand } from '@/features/playback/types/playback-command'
import { calculatePlaybackProgress } from '@/features/playback/utils/calculate-playback-progress'

type SpotifyPlayback = Awaited<ReturnType<typeof SpotifyPlaybackService.getCurrentPlayback>>

interface PlaybackMutationContext {
  previousPlayback: SpotifyPlayback | undefined
  reconciliationSequence: number
}

const playbackReconciliationOffsetsMs = [0, 250, 500, 1_000] as const

function wait(delayMs: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, delayMs))
}

function getPlaybackContentKey(playback: SpotifyPlayback | undefined): string | null {
  const item = playback?.item
  if (!item) return null

  return item.id
    ? `${item.type}:${item.id}`
    : [
        item.type,
        item.title,
        item.collectionName,
        item.creatorNames.join(','),
        item.durationMs
      ].join(':')
}

function hasPlaybackChanged(
  previousPlayback: SpotifyPlayback | undefined,
  currentPlayback: NonNullable<SpotifyPlayback>
): boolean {
  if (getPlaybackContentKey(currentPlayback) !== getPlaybackContentKey(previousPlayback))
    return true

  return Boolean(
    previousPlayback && currentPlayback.progressMs + 2_000 < previousPlayback.progressMs
  )
}

async function reconcilePlaybackAfterSkip(
  queryClient: QueryClient,
  queryKey: ReturnType<typeof spotifyPlaybackQueryKeys.current>,
  previousPlayback: SpotifyPlayback | undefined,
  reconciliationSequence: number,
  getCurrentReconciliationSequence: () => number
): Promise<void> {
  for (const [index, offsetMs] of playbackReconciliationOffsetsMs.entries()) {
    const previousOffsetMs = playbackReconciliationOffsetsMs[index - 1] ?? 0
    const delayMs = offsetMs - previousOffsetMs
    if (delayMs > 0) await wait(delayMs)
    if (reconciliationSequence !== getCurrentReconciliationSequence()) return

    const cachedPlayback = queryClient.getQueryData<SpotifyPlayback>(queryKey)
    if (cachedPlayback && hasPlaybackChanged(previousPlayback, cachedPlayback)) return

    try {
      const currentPlayback = await SpotifyPlaybackService.getCurrentPlayback()
      if (reconciliationSequence !== getCurrentReconciliationSequence()) return

      if (currentPlayback && hasPlaybackChanged(previousPlayback, currentPlayback)) {
        queryClient.setQueryData(queryKey, currentPlayback)
        return
      }

      const isLastAttempt = index === playbackReconciliationOffsetsMs.length - 1
      if (isLastAttempt) queryClient.setQueryData(queryKey, currentPlayback)
    } catch {
      return
    }
  }
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
  const reconciliationSequenceRef = useRef(0)

  useEffect(
    () => () => {
      reconciliationSequenceRef.current += 1
    },
    []
  )

  return useMutation({
    mutationFn: executePlaybackCommand,
    onMutate: async (command) => {
      reconciliationSequenceRef.current += 1
      await queryClient.cancelQueries({ queryKey })
      const previousPlayback = queryClient.getQueryData<SpotifyPlayback>(queryKey)

      queryClient.setQueryData<SpotifyPlayback>(queryKey, (playback) =>
        optimisticallyUpdatePlayingState(playback, command)
      )

      return {
        previousPlayback,
        reconciliationSequence: reconciliationSequenceRef.current
      }
    },
    onError: (_error, _command, context) => {
      if (context?.reconciliationSequence !== reconciliationSequenceRef.current) return
      queryClient.setQueryData(queryKey, context?.previousPlayback)
    },
    onSuccess: (_data, command, context) => {
      if ((command !== 'next' && command !== 'previous') || !context) return

      void reconcilePlaybackAfterSkip(
        queryClient,
        queryKey,
        context.previousPlayback,
        context.reconciliationSequence,
        () => reconciliationSequenceRef.current
      )
    }
  })
}
