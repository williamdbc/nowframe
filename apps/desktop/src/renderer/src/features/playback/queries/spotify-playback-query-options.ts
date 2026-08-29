import { queryOptions } from '@tanstack/react-query'

import { SpotifyPlaybackService } from '../services/spotify-playback-service'
import { shouldDiscardPlayback } from '../utils/playback-expectation'
import { spotifyPlaybackQueryKeys } from './spotify-playback-query-keys'

export const activePlaybackRefetchIntervalMs = 1_500
export const idlePlaybackRefetchIntervalMs = 2_500
export const playbackWindowFocusFreshnessMs = 2_000

/**
 * Perto do fim da faixa o polling adensa. Com a posição interpolada por relógio local, um
 * polling mais rápido não melhora a barra — só serve para descobrir mudança de estado mais
 * cedo, e a mudança mais frequente é a troca natural de faixa. Adensar só nessa janela
 * pega o ganho sem dobrar o volume de requisições em regime permanente.
 */
export const boundaryPlaybackRefetchIntervalMs = 300
export const boundaryPlaybackWindowMs = 2_500

/**
 * Antes, qualquer falha levava a um platô de 30 s: uma oscilação de rede congelava o
 * display por meio minuto. A espera agora cresce e volta ao normal no primeiro sucesso.
 */
export const failedPlaybackRefetchIntervalsMs = [2_000, 5_000, 15_000, 30_000] as const

type SpotifyPlayback = Awaited<ReturnType<typeof SpotifyPlaybackService.getCurrentPlayback>>
type SpotifyPlaybackQueryKey = ReturnType<typeof spotifyPlaybackQueryKeys.current>
type SpotifyPlaybackQueryOptions = ReturnType<
  typeof queryOptions<SpotifyPlayback, Error, SpotifyPlayback, SpotifyPlaybackQueryKey>
>

export function getSpotifyPlaybackRefetchInterval(
  playback: SpotifyPlayback | undefined,
  failureCount: number,
  now: number
): number {
  if (failureCount > 0) {
    const index = Math.min(failureCount - 1, failedPlaybackRefetchIntervalsMs.length - 1)
    return failedPlaybackRefetchIntervalsMs[index]
  }

  if (!playback?.isPlaying) return idlePlaybackRefetchIntervalMs

  // Tocando, mas sem metadado de duração: não há fim de faixa para prever.
  if (!playback.item) return activePlaybackRefetchIntervalMs

  const elapsedMs = Math.max(0, now - playback.synchronizedAt)
  const remainingMs = playback.item.durationMs - (playback.progressMs + elapsedMs)

  return remainingMs <= boundaryPlaybackWindowMs
    ? boundaryPlaybackRefetchIntervalMs
    : activePlaybackRefetchIntervalMs
}

export function shouldRefetchPlaybackOnWindowFocus(dataUpdatedAt: number, now: number): boolean {
  return now - dataUpdatedAt >= playbackWindowFocusFreshnessMs
}

/**
 * Todo resultado de polling passa por aqui antes de virar cache, então é o ponto onde a
 * resposta velha do Spotify é descartada em favor do que já está na tela. Atualização
 * otimista usa `setQueryData`, que não passa por este caminho — é justamente o que se quer
 * preservar.
 */
export function keepPlaybackWhenResponseIsStale(
  previousPlayback: unknown,
  nextPlayback: unknown
): unknown {
  if (previousPlayback === undefined) return nextPlayback

  return shouldDiscardPlayback(nextPlayback as SpotifyPlayback) ? previousPlayback : nextPlayback
}

export function spotifyPlaybackQueryOptions(): SpotifyPlaybackQueryOptions {
  return queryOptions<SpotifyPlayback, Error, SpotifyPlayback, SpotifyPlaybackQueryKey>({
    queryKey: spotifyPlaybackQueryKeys.current(),
    queryFn: () => SpotifyPlaybackService.getCurrentPlayback(),
    refetchInterval: (query) =>
      getSpotifyPlaybackRefetchInterval(
        query.state.data,
        query.state.fetchFailureCount,
        Date.now()
      ),
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: (query) =>
      shouldRefetchPlaybackOnWindowFocus(query.state.dataUpdatedAt, Date.now()),
    retry: false,
    structuralSharing: keepPlaybackWhenResponseIsStale
  })
}
