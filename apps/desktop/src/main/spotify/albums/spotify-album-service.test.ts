import { afterEach, describe, expect, it, vi } from 'vitest'

import { SpotifyAuthService } from '../authentication/spotify-auth-service'
import { SpotifyAlbumClient } from './spotify-album-client'
import { SpotifyAlbumService } from './spotify-album-service'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('SpotifyAlbumService', () => {
  it('forwards a valid album id with the current access token', async () => {
    vi.spyOn(SpotifyAuthService, 'getAccessToken').mockResolvedValue('access-token')
    vi.spyOn(SpotifyAlbumClient, 'getTracks').mockResolvedValue({
      albumId: 'album123',
      tracks: []
    })

    await SpotifyAlbumService.getTracks('album123')

    expect(SpotifyAlbumClient.getTracks).toHaveBeenCalledWith('access-token', 'album123')
  })

  it('rejects invalid album ids before accessing Spotify', async () => {
    const accessTokenSpy = vi.spyOn(SpotifyAuthService, 'getAccessToken')

    await expect(SpotifyAlbumService.getTracks('../album')).rejects.toThrow(
      'O identificador do álbum é inválido.'
    )
    expect(accessTokenSpy).not.toHaveBeenCalled()
  })
})
