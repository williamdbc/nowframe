import { afterEach, describe, expect, it, vi } from 'vitest'

import { SpotifyPlaybackClient } from './spotify-playback-client'

const device = {
  id: 'device-id',
  is_restricted: false,
  name: 'MacBook Pro',
  type: 'Computer',
  volume_percent: 64,
  supports_volume: true
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('SpotifyPlaybackClient', () => {
  it('returns null when there is no active playback', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })))

    await expect(SpotifyPlaybackClient.getCurrentPlayback('access-token')).resolves.toBeNull()
  })

  it('maps the current track, device and volume', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000_000)
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          device,
          is_playing: true,
          progress_ms: 42_000,
          item: {
            id: 'track-id',
            type: 'track',
            name: 'Midnight City',
            duration_ms: 244_000,
            artists: [{ name: 'M83' }],
            album: {
              name: 'Hurry Up, We’re Dreaming',
              images: [{ url: 'https://i.scdn.co/image/album-cover' }]
            }
          }
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    )
    vi.stubGlobal('fetch', fetchMock)

    const playback = await SpotifyPlaybackClient.getCurrentPlayback('access-token')

    expect(fetchMock).toHaveBeenCalledWith('https://api.spotify.com/v1/me/player', {
      headers: { Authorization: 'Bearer access-token' }
    })
    expect(playback).toEqual({
      capabilities: {
        canPause: true,
        canResume: true,
        canSkipNext: true,
        canSkipPrevious: true
      },
      device: {
        id: 'device-id',
        isRestricted: false,
        name: 'MacBook Pro',
        supportsVolume: true,
        type: 'Computer',
        volumePercent: 64
      },
      isPlaying: true,
      item: {
        collectionName: 'Hurry Up, We’re Dreaming',
        creatorNames: ['M83'],
        durationMs: 244_000,
        id: 'track-id',
        imageUrl: 'https://i.scdn.co/image/album-cover',
        title: 'Midnight City',
        type: 'track'
      },
      progressMs: 42_000,
      synchronizedAt: 1_000_000
    })
  })

  it('maps podcast episodes without assuming track metadata', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            device: { ...device, volume_percent: null, supports_volume: false },
            is_playing: false,
            progress_ms: null,
            actions: { pausing: true, skipping_next: true },
            item: {
              id: 'episode-id',
              type: 'episode',
              name: 'A primeira implementação',
              duration_ms: 1_800_000,
              images: [],
              show: {
                name: 'Construindo Produtos',
                images: [{ url: 'https://i.scdn.co/image/show-cover' }]
              }
            }
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
    )

    const playback = await SpotifyPlaybackClient.getCurrentPlayback('access-token')

    expect(playback?.item).toMatchObject({
      collectionName: 'Construindo Produtos',
      creatorNames: ['Construindo Produtos'],
      imageUrl: 'https://i.scdn.co/image/show-cover',
      title: 'A primeira implementação',
      type: 'episode'
    })
    expect(playback?.device).toMatchObject({
      supportsVolume: false,
      volumePercent: null
    })
    expect(playback?.capabilities).toEqual({
      canPause: false,
      canResume: true,
      canSkipNext: false,
      canSkipPrevious: true
    })
  })

  it('sends playback controls to the active Spotify device', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    await SpotifyPlaybackClient.pause('access-token')
    await SpotifyPlaybackClient.resume('access-token')
    await SpotifyPlaybackClient.skipToNext('access-token')
    await SpotifyPlaybackClient.skipToPrevious('access-token')

    const request = (method: 'POST' | 'PUT'): RequestInit => ({
      method,
      headers: { Authorization: 'Bearer access-token' }
    })

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://api.spotify.com/v1/me/player/pause',
      request('PUT')
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://api.spotify.com/v1/me/player/play',
      request('PUT')
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      'https://api.spotify.com/v1/me/player/next',
      request('POST')
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      'https://api.spotify.com/v1/me/player/previous',
      request('POST')
    )
  })

  it('respects the retry window returned by Spotify after rate limiting', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000_000)
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: { status: 429, message: 'Too many requests' } }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Retry-After': '15' }
      })
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(SpotifyPlaybackClient.getCurrentPlayback('access-token')).rejects.toThrow(
      'Too many requests'
    )
    await expect(SpotifyPlaybackClient.getCurrentPlayback('access-token')).rejects.toThrow(
      'O Spotify solicitou uma pausa antes da próxima solicitação.'
    )
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
