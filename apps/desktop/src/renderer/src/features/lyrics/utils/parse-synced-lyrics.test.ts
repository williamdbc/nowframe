import { describe, expect, it } from 'vitest'

import { parsePlainLyrics, parseSyncedLyrics } from './parse-synced-lyrics'

describe('parseSyncedLyrics', () => {
  it('parses, offsets and orders timestamped lines', () => {
    expect(
      parseSyncedLyrics(
        '[offset:-100]\n[01:02.345] Second line\n[00:03.40][00:04.5] Repeated line\n[ar:Artist]'
      )
    ).toEqual([
      { startTimeMs: 3_300, text: 'Repeated line' },
      { startTimeMs: 4_400, text: 'Repeated line' },
      { startTimeMs: 62_245, text: 'Second line' }
    ])
  })

  it('ignores metadata and empty timestamped lines', () => {
    expect(parseSyncedLyrics('[ar:Artist]\n[00:01.00] \n')).toEqual([])
  })
})

describe('parsePlainLyrics', () => {
  it('normalizes line endings and removes empty lines', () => {
    expect(parsePlainLyrics(' First line \r\n\r\nSecond line ')).toEqual([
      'First line',
      'Second line'
    ])
  })
})
