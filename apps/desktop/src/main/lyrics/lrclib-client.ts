import { z } from 'zod'

import type { LyricsQuery, LyricsResult } from '../../contracts/music-display-api'
import { parseLyricsfile } from './lyricsfile-parser'

const lrclibGetUrl = 'https://lrclib.net/api/get'
const requestTimeoutMs = 8_000
const userAgent = 'MusicDisplay/0.1.0 (https://github.com/williamdbc/music-display)'

const lrclibLyricsSchema = z.object({
  albumName: z.string(),
  artistName: z.string(),
  duration: z.number().nonnegative(),
  id: z.number().int().positive(),
  instrumental: z.boolean(),
  lyricsfile: z.string().nullable().optional(),
  plainLyrics: z.string().nullable(),
  syncedLyrics: z.string().nullable(),
  trackName: z.string()
})

const lrclibErrorSchema = z.object({
  message: z.string()
})

async function createLrclibError(response: Response): Promise<Error> {
  const payload: unknown = await response.json().catch(() => null)
  const apiError = lrclibErrorSchema.safeParse(payload)

  if (response.status === 429) {
    return new Error(
      'O serviço de letras está temporariamente ocupado. Tente novamente em instantes.'
    )
  }

  return new Error(
    apiError.success ? apiError.data.message : 'Não foi possível carregar a letra desta música.'
  )
}

export class LrclibClient {
  static async get(query: LyricsQuery): Promise<LyricsResult | null> {
    const url = new URL(lrclibGetUrl)
    url.searchParams.set('track_name', query.trackName)
    url.searchParams.set('artist_name', query.artistName)
    url.searchParams.set('album_name', query.albumName)
    url.searchParams.set('duration', String(Math.round(query.durationMs / 1_000)))

    let response: Response

    try {
      response = await fetch(url, {
        headers: { 'User-Agent': userAgent },
        signal: AbortSignal.timeout(requestTimeoutMs)
      })
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new Error('O serviço de letras demorou para responder.')
      }

      throw new Error('Não foi possível conectar ao serviço de letras.')
    }

    if (response.status === 404) return null
    if (!response.ok) throw await createLrclibError(response)

    const payload: unknown = await response.json().catch(() => null)
    const lyrics = lrclibLyricsSchema.parse(payload)

    return {
      albumName: lyrics.albumName,
      artistName: lyrics.artistName,
      durationMs: Math.round(lyrics.duration * 1_000),
      id: lyrics.id,
      instrumental: lyrics.instrumental,
      plainLyrics: lyrics.plainLyrics,
      source: 'lrclib',
      syncedLyrics: lyrics.syncedLyrics,
      timedLines: parseLyricsfile(lyrics.lyricsfile),
      trackName: lyrics.trackName
    }
  }
}
