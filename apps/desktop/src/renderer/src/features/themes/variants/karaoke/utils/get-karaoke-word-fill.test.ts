import { describe, expect, it } from 'vitest'

import type { WordSyncedLyricsLine } from '@/features/lyrics/types/lyrics-display-state'

import { getKaraokeWordFill } from './get-karaoke-word-fill'

const line: WordSyncedLyricsLine = {
  endTimeMs: 3_000,
  startTimeMs: 1_000,
  text: 'Hello world',
  words: [
    { endTimeMs: 2_000, startTimeMs: 1_000, text: 'Hello ' },
    { endTimeMs: null, startTimeMs: 2_000, text: 'world' }
  ]
}

describe('getKaraokeWordFill', () => {
  it('fills a word proportionally between its start and end timestamps', () => {
    expect(getKaraokeWordFill(line, 0, null, 900)).toBe(0)
    expect(getKaraokeWordFill(line, 0, null, 1_500)).toBe(50)
    expect(getKaraokeWordFill(line, 0, null, 2_100)).toBe(100)
  })

  it('infers a missing word end from the line end', () => {
    expect(getKaraokeWordFill(line, 1, null, 2_500)).toBe(50)
  })
})
