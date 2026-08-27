import type { LyricsQuery } from '../../../../../contracts/music-display-api'

export const lyricsQueryKeys = {
  all: ['lyrics'] as const,
  result: (query: LyricsQuery | 'pending') => [...lyricsQueryKeys.all, 'result', query] as const
}
