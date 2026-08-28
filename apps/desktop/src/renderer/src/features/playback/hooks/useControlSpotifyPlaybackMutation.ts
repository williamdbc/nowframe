import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { QueryClient, UseMutationResult } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

import { spotifyPlaybackQueryKeys } from '@/features/playback/queries/spotify-playback-query-keys'
import { SpotifyPlaybackService } from '@/features/playback/services/spotify-playback-service'
import type { PlaybackCommand } from '@/features/playback/types/playback-command'
import { calculatePlaybackProgress } from '@/features/playback/utils/calculate-playback-progress'
import {
  getPlaybackContentKey,
  getPlaybackItemKey
} from '@/features/playback/utils/get-playback-content-key'

import type {
  SpotifyPlaybackItem,
  SpotifyPlaybackQueue
} from '../../../../../contracts/nowframe-api'

type SpotifyPlayback = Awaited<ReturnType<typeof SpotifyPlaybackService.getCurrentPlayback>>

interface PlaybackMutationContext {
  dispatchedAt: number
  hasOptimisticItem: boolean
  previousPlayback: SpotifyPlayback | undefined
  reconciliationSequence: number
}

/**
 * Offsets medidos a partir do instante em que o comando foi disparado, não do fim da
 * tentativa anterior. Cada consulta de reconciliação custa ~150–260 ms; somar os atrasos
 * ao término de cada uma fazia o ladder derivar para ~0/500/1000/1750 ms.
 */
const playbackReconciliationOffsetsMs = [0, 150, 350, 600, 1_000, 1_500] as const

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
  dispatchedAt: number,
  hasOptimisticItem: boolean
): Promise<void> {
  for (const [index, offsetMs] of playbackReconciliationOffsetsMs.entries()) {
    const delayMs = dispatchedAt + offsetMs - Date.now()
    if (delayMs > 0) await wait(delayMs)
    if (reconciliationSequence !== getCurrentReconciliationSequence()) return

    // Sem palpite otimista, um cache já diferente significa que o polling adiantou o
    // trabalho. Com palpite, o cache é a nossa própria suposição e não confirma nada —
    // a reconciliação precisa ouvir o servidor para poder corrigir um palpite errado.
    if (!hasOptimisticItem) {
      const cachedPlayback = queryClient.getQueryData<SpotifyPlayback>(queryKey)
      if (cachedPlayback && hasPlaybackChanged(previousPlayback, cachedPlayback)) return
    }

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

/**
 * Ao avançar, o próximo conteúdo já é conhecido pela fila em cache, então os metadados
 * podem trocar na hora em vez de esperar o Spotify publicar o novo estado — o que custava
 * o comando mais pelo menos uma consulta de reconciliação (~500 ms no melhor caso).
 *
 * Só se aplica a `next`: em `previous` o Spotify reinicia a faixa atual quando o progresso
 * passou de alguns segundos, então adivinhar produziria um flicker de metadado errado.
 */
function getQueuedNextItem(
  queryClient: QueryClient,
  playback: SpotifyPlayback | undefined
): SpotifyPlaybackItem | null {
  const currentItemKey = getPlaybackContentKey(playback)
  if (!currentItemKey) return null

  const queue = queryClient.getQueryData<SpotifyPlaybackQueue>(
    spotifyPlaybackQueryKeys.queue(currentItemKey)
  )
  const nextItem = queue?.items[0] ?? null

  // Uma fila obsoleta pode listar o próprio conteúdo atual; nesse caso não há palpite útil.
  return getPlaybackItemKey(nextItem) === currentItemKey ? null : nextItem
}

function optimisticallyAdvanceToItem(
  playback: SpotifyPlayback | undefined,
  nextItem: SpotifyPlaybackItem
): SpotifyPlayback | undefined {
  if (!playback) return playback

  return {
    ...playback,
    item: nextItem,
    progressMs: 0,
    synchronizedAt: Date.now()
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
      const queuedNextItem =
        command === 'next' ? getQueuedNextItem(queryClient, previousPlayback) : null

      queryClient.setQueryData<SpotifyPlayback>(queryKey, (playback) =>
        queuedNextItem
          ? optimisticallyAdvanceToItem(playback, queuedNextItem)
          : optimisticallyUpdatePlayingState(playback, command)
      )

      return {
        dispatchedAt: Date.now(),
        hasOptimisticItem: queuedNextItem !== null,
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
        () => reconciliationSequenceRef.current,
        context.dispatchedAt,
        context.hasOptimisticItem
      )
    }
  })
}
