import type { WordSyncedLyricsLine } from '@/features/lyrics/types/lyrics-display-state'

export function getKaraokeWordFill(
  line: WordSyncedLyricsLine,
  wordIndex: number,
  nextLineStartTimeMs: number | null,
  positionMs: number
): number {
  const word = line.words[wordIndex]
  if (!word) return 0

  const inferredEndTimeMs =
    word.endTimeMs ??
    line.words[wordIndex + 1]?.startTimeMs ??
    line.endTimeMs ??
    nextLineStartTimeMs ??
    word.startTimeMs + 600
  const endTimeMs = Math.max(word.startTimeMs + 1, inferredEndTimeMs)

  if (positionMs <= word.startTimeMs) return 0
  if (positionMs >= endTimeMs) return 100
  return ((positionMs - word.startTimeMs) / (endTimeMs - word.startTimeMs)) * 100
}
