import { queryOptions } from '@tanstack/react-query'

import { SpotifyPlaybackService } from '../services/spotify-playback-service'
import { spotifyPlaybackQueryKeys } from './spotify-playback-query-keys'

export const activePlaybackRefetchIntervalMs = 1_000
export const idlePlaybackRefetchIntervalMs = 2_000

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
    refetchOnWindowFocus: 'always',
    retry: false
  })
}
