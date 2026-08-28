import { afterEach, describe, expect, it, vi } from 'vitest'

import { isRateLimited, resetRateLimitState } from '../spotify-rate-limit'
import { estimatePlaybackSynchronizedAt, SpotifyPlaybackClient } from './spotify-playback-client'

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
  resetRateLimitState()
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
          context: {
            type: 'playlist',
            uri: 'spotify:playlist:playlistid'
          },
          device,
          is_playing: true,
          repeat_state: 'context',
          shuffle_state: true,
          progress_ms: 42_000,
          item: {
            id: 'track-id',
            type: 'track',
            name: 'Midnight City',
            duration_ms: 244_000,
            artists: [{ name: 'M83' }],
            album: {
              id: 'album-id',
              name: 'Hurry Up, We’re Dreaming',
              images: [{ url: 'https://i.scdn.co/image/album-cover' }],
              uri: 'spotify:album:album-id'
            },
            uri: 'spotify:track:trackid'
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
        canSeek: true,
        canSetVolume: true,
        canSkipNext: true,
        canSkipPrevious: true,
        canToggleRepeat: true,
        canToggleShuffle: true
      },
      context: {
        id: 'playlistid',
        type: 'playlist',
        uri: 'spotify:playlist:playlistid'
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
        album: { id: 'album-id', uri: 'spotify:album:album-id' },
        collectionName: 'Hurry Up, We’re Dreaming',
        creatorNames: ['M83'],
        durationMs: 244_000,
        id: 'track-id',
        imageUrl: 'https://i.scdn.co/image/album-cover',
        title: 'Midnight City',
        type: 'track',
        uri: 'spotify:track:trackid'
      },
      progressMs: 42_000,
      repeatMode: 'context',
      shuffleEnabled: true,
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
            repeat_state: 'off',
            shuffle_state: false,
            progress_ms: null,
            actions: {
              pausing: true,
              seeking: true,
              skipping_next: true,
              toggling_repeat_context: true,
              toggling_repeat_track: true,
              toggling_shuffle: true
            },
            item: {
              id: 'episode-id',
              type: 'episode',
              name: 'A primeira implementação',
              duration_ms: 1_800_000,
              images: [],
              show: {
                name: 'Construindo Produtos',
                images: [{ url: 'https://i.scdn.co/image/show-cover' }]
              },
              uri: 'spotify:episode:episodeid'
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
      canSeek: false,
      canSetVolume: false,
      canSkipNext: false,
      canSkipPrevious: true,
      canToggleRepeat: false,
      canToggleShuffle: false
    })
  })

  it('sends playback controls to the active Spotify device', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    await SpotifyPlaybackClient.pause('access-token')
    await SpotifyPlaybackClient.resume('access-token')
    await SpotifyPlaybackClient.seek('access-token', 75_000)
    await SpotifyPlaybackClient.setVolume('access-token', 42)
    await SpotifyPlaybackClient.setRepeatMode('access-token', 'track')
    await SpotifyPlaybackClient.setShuffle('access-token', true)
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
      'https://api.spotify.com/v1/me/player/seek?position_ms=75000',
      request('PUT')
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      'https://api.spotify.com/v1/me/player/volume?volume_percent=42',
      request('PUT')
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      5,
      'https://api.spotify.com/v1/me/player/repeat?state=track',
      request('PUT')
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      6,
      'https://api.spotify.com/v1/me/player/shuffle?state=true',
      request('PUT')
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      7,
      'https://api.spotify.com/v1/me/player/next',
      request('POST')
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      8,
      'https://api.spotify.com/v1/me/player/previous',
      request('POST')
    )
  })

  it('starts a playback context from the selected position', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    await SpotifyPlaybackClient.playContextTrack('access-token', 'spotify:playlist:playlist-id', 3)

    expect(fetchMock).toHaveBeenCalledWith('https://api.spotify.com/v1/me/player/play', {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer access-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        context_uri: 'spotify:playlist:playlist-id',
        offset: { position: 3 },
        position_ms: 0
      })
    })
  })

  it('explains when Spotify restricts going back from the current content', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: {
              status: 403,
              message: 'Player command failed: Restriction violated'
            }
          }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        )
      )
    )

    await expect(SpotifyPlaybackClient.skipToPrevious('access-token')).rejects.toThrow(
      'Não é possível voltar agora. Você pode já estar na primeira faixa ou este conteúdo não permite essa ação.'
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

  /**
   * A regressão que motivou separar o gate: um 429 no polling deixava play, pause e skip
   * mortos por no mínimo 30 s, o que lê como app travado.
   */
  it('still lets a person-initiated command through during the rate limit window', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(3_000_000)
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: { status: 429, message: 'Too many requests' } }), {
          status: 429,
          headers: { 'Content-Type': 'application/json', 'Retry-After': '30' }
        })
      )
      .mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(SpotifyPlaybackClient.getCurrentPlayback('access-token')).rejects.toThrow(
      'Too many requests'
    )

    // O polling espera...
    await expect(SpotifyPlaybackClient.getCurrentPlayback('access-token')).rejects.toThrow(
      'O Spotify solicitou uma pausa antes da próxima solicitação.'
    )

    // ...mas o comando vai.
    await expect(SpotifyPlaybackClient.pause('access-token')).resolves.toBeUndefined()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('reopens polling once a request succeeds', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(4_000_000)
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ error: { status: 429, message: 'Too many requests' } }), {
            status: 429,
            headers: { 'Content-Type': 'application/json', 'Retry-After': '30' }
          })
        )
        .mockResolvedValue(new Response(null, { status: 204 }))
    )

    await expect(SpotifyPlaybackClient.getCurrentPlayback('access-token')).rejects.toThrow(
      'Too many requests'
    )
    expect(isRateLimited()).toBe(true)

    await SpotifyPlaybackClient.pause('access-token')

    expect(isRateLimited()).toBe(false)
    await expect(SpotifyPlaybackClient.getCurrentPlayback('access-token')).resolves.toBeNull()
  })

  it('anchors the synchronization clock at the middle of the round trip', async () => {
    // O progresso relatado era verdade no servidor por volta da metade da viagem, não na
    // chegada da resposta: 2_000_000 de saída, 2_000_240 de volta => 2_000_120.
    // Os timestamps ficam além da janela de rate limit que o teste anterior deixou no
    // `rateLimitedUntil`, que é estado de módulo e atravessa testes.
    let hasResponded = false
    vi.spyOn(Date, 'now').mockImplementation(() => (hasResponded ? 2_000_240 : 2_000_000))
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() => {
        hasResponded = true

        return Promise.resolve(
          new Response(
            JSON.stringify({
              device,
              is_playing: true,
              repeat_state: 'off',
              shuffle_state: false,
              progress_ms: 42_000,
              item: {
                id: 'track-id',
                type: 'track',
                name: 'Midnight City',
                duration_ms: 244_000,
                artists: [{ name: 'M83' }],
                album: {
                  id: 'album-id',
                  name: 'Hurry Up, We’re Dreaming',
                  images: [{ url: 'https://i.scdn.co/image/album-cover' }],
                  uri: 'spotify:album:album-id'
                },
                uri: 'spotify:track:trackid'
              }
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          )
        )
      })
    )

    await expect(SpotifyPlaybackClient.getCurrentPlayback('access-token')).resolves.toMatchObject({
      progressMs: 42_000,
      synchronizedAt: 2_000_120
    })
  })
})

describe('estimatePlaybackSynchronizedAt', () => {
  it('compensates half of the observed round trip', () => {
    expect(estimatePlaybackSynchronizedAt(1_000, 1_260)).toBe(1_130)
  })

  it('collapses to the request instant when the response is immediate', () => {
    expect(estimatePlaybackSynchronizedAt(1_000, 1_000)).toBe(1_000)
  })

  it('never travels backwards when the clock moves non-monotonically', () => {
    expect(estimatePlaybackSynchronizedAt(1_000, 900)).toBe(1_000)
  })
})
