import { z } from 'zod'

import type { LyricsResult } from '../../contracts/music-display-api'
import { LrclibClient } from './lrclib-client'

const lyricsQuerySchema = z.object({
  albumName: z.string().trim().min(1).max(500),
  artistName: z.string().trim().min(1).max(500),
  durationMs: z.number().int().positive().max(3_600_000),
  trackName: z.string().trim().min(1).max(500)
})

export class LyricsService {
  static async get(query: unknown): Promise<LyricsResult | null> {
    const parsedQuery = lyricsQuerySchema.safeParse(query)

    if (!parsedQuery.success) {
      throw new Error('Os dados da música são inválidos para buscar a letra.')
    }

    return LrclibClient.get(parsedQuery.data)
  }
}
