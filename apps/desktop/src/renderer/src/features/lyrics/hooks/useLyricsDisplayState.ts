import { useMemo } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'

import type { LyricsResult } from '../../../../../contracts/music-display-api'
import type { LyricsDisplayState } from '../types/lyrics-display-state'
import { parsePlainLyrics, parseSyncedLyrics } from '../utils/parse-synced-lyrics'

export function useLyricsDisplayState(
  query: UseQueryResult<LyricsResult | null, Error>,
  enabled: boolean
): LyricsDisplayState {
  return useMemo(() => {
    if (!enabled) return { status: 'idle', plainLines: [], syncedLines: [] }
    if (query.isPending) return { status: 'loading', plainLines: [], syncedLines: [] }
    if (query.isError) {
      return {
        status: 'error',
        errorMessage: query.error.message,
        plainLines: [],
        syncedLines: []
      }
    }
    if (!query.data) return { status: 'not-found', plainLines: [], syncedLines: [] }
    if (query.data.instrumental) {
      return { status: 'instrumental', plainLines: [], syncedLines: [] }
    }

    const plainLines = parsePlainLyrics(query.data.plainLyrics)
    const syncedLines = parseSyncedLyrics(query.data.syncedLyrics)

    if (syncedLines.length > 0) return { status: 'synced', plainLines, syncedLines }
    if (plainLines.length > 0) return { status: 'plain', plainLines, syncedLines: [] }
    return { status: 'not-found', plainLines: [], syncedLines: [] }
  }, [enabled, query.data, query.error, query.isError, query.isPending])
}
