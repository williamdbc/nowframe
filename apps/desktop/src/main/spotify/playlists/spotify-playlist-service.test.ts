import { afterEach, describe, expect, it, vi } from 'vitest'

import { SpotifyAuthService } from '../authentication/spotify-auth-service'
import { SpotifyPlaylistClient } from './spotify-playlist-client'
import { SpotifyPlaylistService } from './spotify-playlist-service'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('SpotifyPlaylistService', () => {
  it('forwards a valid playlist id with the current access token', async () => {
    vi.spyOn(SpotifyAuthService, 'getAccessToken').mockResolvedValue('access-token')
    vi.spyOn(SpotifyPlaylistClient, 'getTracks').mockResolvedValue({
      imageUrl: null,
      name: 'Road Trip',
      playlistId: 'playlist123',
      tracks: []
    })

    await SpotifyPlaylistService.getTracks('playlist123')

    expect(SpotifyPlaylistClient.getTracks).toHaveBeenCalledWith('access-token', 'playlist123')
  })

  it('rejects invalid playlist ids before accessing Spotify', async () => {
    const accessTokenSpy = vi.spyOn(SpotifyAuthService, 'getAccessToken')

    await expect(SpotifyPlaylistService.getTracks('../playlist')).rejects.toThrow(
      'O identificador da playlist é inválido.'
    )
    expect(accessTokenSpy).not.toHaveBeenCalled()
  })
})
