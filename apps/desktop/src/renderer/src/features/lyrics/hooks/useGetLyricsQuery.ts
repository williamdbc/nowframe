import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'

import type { LyricsQuery, LyricsResult } from '../../../../../contracts/music-display-api'
import { lyricsQueryKeys } from '../queries/lyrics-query-keys'
import { LyricsService } from '../services/lyrics-service'

export function useGetLyricsQuery(
  query: LyricsQuery | null,
  enabled: boolean
): UseQueryResult<LyricsResult | null, Error> {
  return useQuery({
    queryKey: lyricsQueryKeys.result(query ?? 'pending'),
    queryFn: () => LyricsService.get(query!),
    enabled: Boolean(query) && enabled,
    retry: false,
    staleTime: 30 * 60_000
  })
}
