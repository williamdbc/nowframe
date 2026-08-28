import { afterEach, describe, expect, it, vi } from 'vitest'

import { SpotifyPlaylistClient } from './spotify-playlist-client'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('SpotifyPlaylistClient', () => {
  it('loads playlist metadata, items and individual album covers', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 'playlist-id',
            images: [{ url: 'https://i.scdn.co/image/playlist-cover' }],
            name: 'Road Trip'
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            items: [
              {
                item: {
                  album: { images: [{ url: 'https://i.scdn.co/image/album-cover' }] },
                  artists: [{ name: 'Scorpions' }],
                  disc_number: 1,
                  duration_ms: 312_000,
                  id: 'track-id',
                  is_playable: true,
                  name: 'Wind Of Change',
                  track_number: 4,
                  type: 'track',
                  uri: 'spotify:track:track-id'
                }
              }
            ],
            offset: 0,
            total: 1
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
    vi.stubGlobal('fetch', fetchMock)

    await expect(SpotifyPlaylistClient.getTracks('access-token', 'playlist-id')).resolves.toEqual({
      imageUrl: 'https://i.scdn.co/image/playlist-cover',
      name: 'Road Trip',
      playlistId: 'playlist-id',
      tracks: [
        {
          creatorNames: ['Scorpions'],
          discNumber: 1,
          durationMs: 312_000,
          id: 'track-id',
          imageUrl: 'https://i.scdn.co/image/album-cover',
          isPlayable: true,
          position: 0,
          title: 'Wind Of Change',
          trackNumber: 4,
          uri: 'spotify:track:track-id'
        }
      ]
    })
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://api.spotify.com/v1/playlists/playlist-id?fields=id,name,images',
      { headers: { Authorization: 'Bearer access-token' } }
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://api.spotify.com/v1/playlists/playlist-id/items?limit=50&offset=0',
      { headers: { Authorization: 'Bearer access-token' } }
    )
  })

  it('supports the legacy track field while Spotify completes the items migration', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 'playlist-id',
            images: [],
            name: 'Legacy Playlist'
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            items: [
              {
                track: {
                  album: { images: [] },
                  artists: [{ name: 'Scorpions' }],
                  disc_number: 1,
                  duration_ms: 312_000,
                  id: 'legacy-track-id',
                  name: 'Wind Of Change',
                  track_number: 4,
                  type: 'track',
                  uri: 'spotify:track:legacy-track-id'
                }
              }
            ],
            offset: 0,
            total: 1
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
    vi.stubGlobal('fetch', fetchMock)

    const tracklist = await SpotifyPlaylistClient.getTracks('access-token', 'playlist-id')

    expect(tracklist.tracks).toEqual([
      expect.objectContaining({
        id: 'legacy-track-id',
        imageUrl: null,
        isPlayable: true,
        title: 'Wind Of Change'
      })
    ])
  })

  it('explains the current playlist ownership restriction', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 403 })))

    await expect(SpotifyPlaylistClient.getTracks('access-token', 'playlist-id')).rejects.toThrow(
      'O Spotify só permite listar playlists da sua conta ou em que você é colaborador.'
    )
  })
})
