import { afterEach, describe, expect, it, vi } from 'vitest'

import { LrclibClient } from './lrclib-client'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('LrclibClient', () => {
  it('matches a track by metadata and maps synchronized lyrics', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          albumName: 'Crazy World',
          artistName: 'Scorpions',
          duration: 312,
          id: 394343,
          instrumental: false,
          lyricsfile: `
version: '1.0'
metadata:
  title: Wind Of Change
  artist: Scorpions
lines:
  - text: 'A first line'
    start_ms: 22660
    end_ms: 25000
    words:
      - text: 'A first '
        start_ms: 22660
        end_ms: 24000
      - text: 'line'
        start_ms: 24000
        end_ms: 25000
`,
          plainLyrics: 'A first line',
          syncedLyrics: '[00:22.66] A first line',
          trackName: 'Wind Of Change'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      LrclibClient.get({
        albumName: 'Crazy World',
        artistName: 'Scorpions',
        durationMs: 312_000,
        trackName: 'Wind Of Change'
      })
    ).resolves.toEqual({
      albumName: 'Crazy World',
      artistName: 'Scorpions',
      durationMs: 312_000,
      id: 394343,
      instrumental: false,
      plainLyrics: 'A first line',
      source: 'lrclib',
      syncedLyrics: '[00:22.66] A first line',
      timedLines: [
        {
          endTimeMs: 25_000,
          startTimeMs: 22_660,
          text: 'A first line',
          words: [
            { endTimeMs: 24_000, startTimeMs: 22_660, text: 'A first ' },
            { endTimeMs: 25_000, startTimeMs: 24_000, text: 'line' }
          ]
        }
      ],
      trackName: 'Wind Of Change'
    })

    const [url, options] = fetchMock.mock.calls[0] as [URL, RequestInit]
    expect(url.origin + url.pathname).toBe('https://lrclib.net/api/get')
    expect(Object.fromEntries(url.searchParams)).toEqual({
      album_name: 'Crazy World',
      artist_name: 'Scorpions',
      duration: '312',
      track_name: 'Wind Of Change'
    })
    expect(options.headers).toEqual({
      'User-Agent': 'MusicDisplay/0.1.0 (https://github.com/williamdbc/music-display)'
    })
  })

  it('treats a missing lyrics record as an empty result', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 404 })))

    await expect(
      LrclibClient.get({
        albumName: 'Unknown album',
        artistName: 'Unknown artist',
        durationMs: 180_000,
        trackName: 'Unknown track'
      })
    ).resolves.toBeNull()
  })
})
