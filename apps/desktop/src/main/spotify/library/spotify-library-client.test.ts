import { afterEach, describe, expect, it, vi } from 'vitest'

import { SpotifyLibraryClient } from './spotify-library-client'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('SpotifyLibraryClient', () => {
  it('checks, saves and removes an item using its Spotify URI', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify([true]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      )
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    const uri = 'spotify:track:trackid'

    await expect(SpotifyLibraryClient.getItemState('access-token', uri)).resolves.toEqual({
      isSaved: true,
      uri
    })
    await SpotifyLibraryClient.saveItem('access-token', uri)
    await SpotifyLibraryClient.removeItem('access-token', uri)

    const request = (method: 'DELETE' | 'GET' | 'PUT'): RequestInit => ({
      method,
      headers: { Authorization: 'Bearer access-token' }
    })
    const encodedUri = 'spotify%3Atrack%3Atrackid'

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `https://api.spotify.com/v1/me/library/contains?uris=${encodedUri}`,
      request('GET')
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `https://api.spotify.com/v1/me/library?uris=${encodedUri}`,
      request('PUT')
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      `https://api.spotify.com/v1/me/library?uris=${encodedUri}`,
      request('DELETE')
    )
  })

  it('surfaces the Spotify API error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: { message: 'Insufficient client scope' } }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    )

    await expect(
      SpotifyLibraryClient.saveItem('access-token', 'spotify:track:trackid')
    ).rejects.toThrow('Insufficient client scope')
  })
})
