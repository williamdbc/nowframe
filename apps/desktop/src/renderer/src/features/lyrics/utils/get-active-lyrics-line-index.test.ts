import { describe, expect, it } from 'vitest'

import { getActiveLyricsLineIndex } from './get-active-lyrics-line-index'

const lines = [
  { startTimeMs: 1_000, text: 'First' },
  { startTimeMs: 2_500, text: 'Second' },
  { startTimeMs: 5_000, text: 'Third' }
]

describe('getActiveLyricsLineIndex', () => {
  it('returns no active line before the first timestamp', () => {
    expect(getActiveLyricsLineIndex(lines, 999)).toBe(-1)
  })

  it('returns the latest line at or before playback progress', () => {
    expect(getActiveLyricsLineIndex(lines, 2_500)).toBe(1)
    expect(getActiveLyricsLineIndex(lines, 4_999)).toBe(1)
    expect(getActiveLyricsLineIndex(lines, 8_000)).toBe(2)
  })
})
