import { parseDocument } from 'yaml'
import { z } from 'zod'

import type { LyricsTimedLine } from '../../contracts/nowframe-api'

const maximumLyricsfileLength = 500_000

const lyricsfileWordSchema = z
  .object({
    end_ms: z.number().int().nonnegative().optional(),
    start_ms: z.number().int().nonnegative(),
    text: z.string()
  })
  .refine((word) => word.end_ms === undefined || word.end_ms >= word.start_ms)

const lyricsfileLineSchema = z
  .object({
    end_ms: z.number().int().nonnegative().optional(),
    start_ms: z.number().int().nonnegative(),
    text: z.string(),
    words: z.array(lyricsfileWordSchema).max(1_000).optional().default([])
  })
  .refine((line) => line.end_ms === undefined || line.end_ms >= line.start_ms)

const lyricsfileSchema = z.object({
  lines: z.array(lyricsfileLineSchema).max(10_000).optional().default([]),
  version: z.literal('1.0')
})

export function parseLyricsfile(lyricsfile: string | null | undefined): LyricsTimedLine[] {
  if (!lyricsfile?.trim() || lyricsfile.length > maximumLyricsfileLength) return []

  try {
    const document = parseDocument(lyricsfile, {
      logLevel: 'silent',
      schema: 'core',
      strict: true,
      stringKeys: true
    })

    if (document.errors.length > 0) return []

    const parsedLyricsfile = lyricsfileSchema.safeParse(
      document.toJS({ maxAliasCount: 0 }) as unknown
    )
    if (!parsedLyricsfile.success) return []

    return parsedLyricsfile.data.lines
      .map((line) => ({
        endTimeMs: line.end_ms ?? null,
        startTimeMs: line.start_ms,
        text: line.text,
        words: line.words.map((word) => ({
          endTimeMs: word.end_ms ?? null,
          startTimeMs: word.start_ms,
          text: word.text
        }))
      }))
      .sort((first, second) => first.startTimeMs - second.startTimeMs)
  } catch {
    return []
  }
}
