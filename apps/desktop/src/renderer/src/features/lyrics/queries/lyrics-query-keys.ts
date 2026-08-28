import type { LyricsQuery } from '../../../../../contracts/nowframe-api'

export const lyricsQueryKeys = {
  all: ['lyrics'] as const,
  result: (query: LyricsQuery | 'pending') => [...lyricsQueryKeys.all, 'result', query] as const
}
