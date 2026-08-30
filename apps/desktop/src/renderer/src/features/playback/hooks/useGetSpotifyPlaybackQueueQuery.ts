import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'

import type { SpotifyPlaybackQueue } from '../../../../../contracts/nowframe-api'
import { spotifyPlaybackQueryKeys } from '../queries/spotify-playback-query-keys'
import { SpotifyPlaybackService } from '../services/spotify-playback-service'

/**
 * A fila só é consultada quando o conteúdo atual muda — a chave da query carrega a
 * identidade da faixa em reprodução. O cache não possui consumidor no fluxo atual e
 * permanece temporariamente como dívida técnica; ele não antecipa metadados ao avançar.
 */
export function useGetSpotifyPlaybackQueueQuery(
  currentItemKey: string | null
): UseQueryResult<SpotifyPlaybackQueue, Error> {
  return useQuery({
    queryKey: spotifyPlaybackQueryKeys.queue(currentItemKey ?? 'idle'),
    queryFn: () => SpotifyPlaybackService.getQueue(),
    enabled: Boolean(currentItemKey),
    retry: false,
    staleTime: 30_000,
    gcTime: 120_000
  })
}
