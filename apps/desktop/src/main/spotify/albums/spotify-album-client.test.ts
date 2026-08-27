import { afterEach, describe, expect, it, vi } from 'vitest'

import { SpotifyAlbumClient } from './spotify-album-client'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('SpotifyAlbumClient', () => {
  it('loads and maps album tracks in their original order', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            {
              artists: [{ name: 'M83' }],
              disc_number: 1,
              duration_ms: 244_000,
              id: 'track-id',
              is_playable: true,
              name: 'Midnight City',
              track_number: 2,
              uri: 'spotify:track:track-id'
            }
          ],
          offset: 0,
          total: 1
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(SpotifyAlbumClient.getTracks('access-token', 'album-id')).resolves.toEqual({
      albumId: 'album-id',
      tracks: [
        {
          creatorNames: ['M83'],
          discNumber: 1,
          durationMs: 244_000,
          id: 'track-id',
          imageUrl: null,
          isPlayable: true,
          position: 0,
          title: 'Midnight City',
          trackNumber: 2,
          uri: 'spotify:track:track-id'
        }
      ]
    })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.spotify.com/v1/albums/album-id/tracks?limit=50&offset=0',
      { headers: { Authorization: 'Bearer access-token' } }
    )
  })

  it('surfaces the Spotify API error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: { message: 'Album not found' } }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    )

    await expect(SpotifyAlbumClient.getTracks('access-token', 'missing')).rejects.toThrow(
      'Album not found'
    )
  })
})
