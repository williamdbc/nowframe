import type { SyncedLyricsLine } from '../types/lyrics-display-state'

const offsetPattern = /^\[offset:([+-]?\d+)]$/i
const timestampPattern = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?]/g

function parseFractionMilliseconds(value: string | undefined): number {
  if (!value) return 0
  if (value.length === 1) return Number(value) * 100
  if (value.length === 2) return Number(value) * 10
  return Number(value.slice(0, 3))
}

export function parseSyncedLyrics(syncedLyrics: string | null): SyncedLyricsLine[] {
  if (!syncedLyrics?.trim()) return []

  const sourceLines = syncedLyrics.split(/\r?\n/)
  const offsetMs = sourceLines.reduce((currentOffset, line) => {
    const match = offsetPattern.exec(line.trim())
    return match ? Number(match[1]) : currentOffset
  }, 0)
  const parsedLines: SyncedLyricsLine[] = []

  for (const sourceLine of sourceLines) {
    const matches = [...sourceLine.matchAll(timestampPattern)]
    if (matches.length === 0) continue

    const text = sourceLine.replace(timestampPattern, '').trim()
    if (!text) continue

    for (const match of matches) {
      const minutes = Number(match[1])
      const seconds = Number(match[2])
      const fractionMs = parseFractionMilliseconds(match[3])

      parsedLines.push({
        startTimeMs: Math.max(0, (minutes * 60 + seconds) * 1_000 + fractionMs + offsetMs),
        text
      })
    }
  }

  return parsedLines.sort((first, second) => first.startTimeMs - second.startTimeMs)
}

export function parsePlainLyrics(plainLyrics: string | null): string[] {
  if (!plainLyrics?.trim()) return []
  return plainLyrics
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}
