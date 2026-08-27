import type { SyncedLyricsLine } from '../types/lyrics-display-state'

export function getActiveLyricsLineIndex(
  lines: readonly SyncedLyricsLine[],
  positionMs: number
): number {
  let start = 0
  let end = lines.length - 1
  let activeIndex = -1

  while (start <= end) {
    const middle = Math.floor((start + end) / 2)

    if (lines[middle].startTimeMs <= positionMs) {
      activeIndex = middle
      start = middle + 1
    } else {
      end = middle - 1
    }
  }

  return activeIndex
}
