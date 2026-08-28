import { describe, expect, it } from 'vitest'

import { parseLyricsfile } from './lyricsfile-parser'

describe('parseLyricsfile', () => {
  it('maps line and word timestamps from a Lyricsfile document', () => {
    expect(
      parseLyricsfile(`
version: '1.0'
metadata:
  title: Example
  artist: Example Artist
lines:
  - text: 'Hello world'
    start_ms: 1200
    end_ms: 2800
    words:
      - text: 'Hello '
        start_ms: 1200
        end_ms: 1900
      - text: 'world'
        start_ms: 1900
        end_ms: 2800
`)
    ).toEqual([
      {
        endTimeMs: 2_800,
        startTimeMs: 1_200,
        text: 'Hello world',
        words: [
          { endTimeMs: 1_900, startTimeMs: 1_200, text: 'Hello ' },
          { endTimeMs: 2_800, startTimeMs: 1_900, text: 'world' }
        ]
      }
    ])
  })

  it('rejects aliases and invalid timing without affecting line-synced fallback', () => {
    expect(parseLyricsfile("version: '1.0'\nlines: &lines []\ncopy: *lines")).toEqual([])
    expect(
      parseLyricsfile(
        "version: '1.0'\nlines:\n  - text: Invalid\n    start_ms: 2000\n    end_ms: 1000"
      )
    ).toEqual([])
  })
})
