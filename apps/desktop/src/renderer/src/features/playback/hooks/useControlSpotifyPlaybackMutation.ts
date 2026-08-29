import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { QueryClient, UseMutationResult } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

import { spotifyPlaybackQueryKeys } from '@/features/playback/queries/spotify-playback-query-keys'
import { SpotifyPlaybackService } from '@/features/playback/services/spotify-playback-service'
import type { PlaybackCommand } from '@/features/playback/types/playback-command'
import { calculatePlaybackProgress } from '@/features/playback/utils/calculate-playback-progress'
import { getPlaybackContentKey } from '@/features/playback/utils/get-playback-content-key'
import {
  clearPlaybackExpectation,
  expectPlayback
} from '@/features/playback/utils/playback-expectation'

type SpotifyPlayback = Awaited<ReturnType<typeof SpotifyPlaybackService.getCurrentPlayback>>

interface PlaybackMutationContext {
  dispatchedAt: number
  previousPlayback: SpotifyPlayback | undefined
  reconciliationSequence: number
}

/**
 * Offsets medidos a partir do instante em que o comando foi disparado, não do fim da
 * tentativa anterior. Assim, a confirmação fica limitada ao primeiro segundo mesmo que
 * cada consulta ao Spotify leve alguns centenas de milissegundos.
 */
const playbackReconciliationOffsetsMs = [0, 200, 500, 1_000] as const

function wait(delayMs: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, delayMs))
}

function hasPlaybackChanged(
  previousPlayback: SpotifyPlayback | undefined,
  currentPlayback: NonNullable<SpotifyPlayback>
): boolean {
  // `stateChangedAt` é o único sinal autoritativo de que o player mudou de estado, e pega
  // casos que as heurísticas abaixo não veem — avançar para a mesma faixa em repeat, por
  // exemplo. Só é usado como sinal positivo: o campo tem histórico de vir ausente ou
  // zerado, então igualdade não vale como prova de que nada mudou.
  const previousStateChangedAt = previousPlayback?.stateChangedAt
  if (
    previousStateChangedAt != null &&
    currentPlayback.stateChangedAt != null &&
    currentPlayback.stateChangedAt !== previousStateChangedAt
  ) {
    return true
  }

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
  getCurrentReconciliationSequence: () => number,
  dispatchedAt: number
): Promise<void> {
  for (const [index, offsetMs] of playbackReconciliationOffsetsMs.entries()) {
    const delayMs = dispatchedAt + offsetMs - Date.now()
    if (delayMs > 0) await wait(delayMs)
    if (reconciliationSequence !== getCurrentReconciliationSequence()) return

    // Se o polling já confirmou a troca, não gastamos outra chamada de reconciliação.
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

      // Ao trocar de faixa, o polling ainda relata a anterior por um tempo. Sem esta
      // expectativa o cache oscilava entre as duas, e como o tema usa a identidade da
      // faixa como `key`, cada oscilação remontava a seção e reiniciava as animações —
      // era o conteúdo "piscando" ao pular.
      if (command === 'next' || command === 'previous') {
        const previousContentKey = getPlaybackContentKey(previousPlayback)
        expectPlayback((playback) => getPlaybackContentKey(playback) !== previousContentKey)
      }

      return {
        dispatchedAt: Date.now(),
        previousPlayback,
        reconciliationSequence: reconciliationSequenceRef.current
      }
    },
    onError: (_error, _command, context) => {
      clearPlaybackExpectation()
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
        () => reconciliationSequenceRef.current,
        context.dispatchedAt
      )
    }
  })
}
