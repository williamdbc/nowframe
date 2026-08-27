import { afterEach, describe, expect, it, vi } from 'vitest'

import { SpotifyAuthService } from '../authentication/spotify-auth-service'
import { SpotifyLibraryClient } from './spotify-library-client'
import { SpotifyLibraryService } from './spotify-library-service'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('SpotifyLibraryService', () => {
  it('forwards supported URIs with the current access token', async () => {
    vi.spyOn(SpotifyAuthService, 'getAccessToken').mockResolvedValue('access-token')
    vi.spyOn(SpotifyLibraryClient, 'getItemState').mockResolvedValue({
      isSaved: false,
      uri: 'spotify:episode:episodeid'
    })
    vi.spyOn(SpotifyLibraryClient, 'saveItem').mockResolvedValue(undefined)
    vi.spyOn(SpotifyLibraryClient, 'removeItem').mockResolvedValue(undefined)

    await SpotifyLibraryService.getItemState('spotify:episode:episodeid')
    await SpotifyLibraryService.saveItem('spotify:track:trackid')
    await SpotifyLibraryService.removeItem('spotify:track:trackid')

    expect(SpotifyLibraryClient.getItemState).toHaveBeenCalledWith(
      'access-token',
      'spotify:episode:episodeid'
    )
    expect(SpotifyLibraryClient.saveItem).toHaveBeenCalledWith(
      'access-token',
      'spotify:track:trackid'
    )
    expect(SpotifyLibraryClient.removeItem).toHaveBeenCalledWith(
      'access-token',
      'spotify:track:trackid'
    )
  })

  it('rejects unsupported URIs before accessing Spotify', async () => {
    const accessTokenSpy = vi.spyOn(SpotifyAuthService, 'getAccessToken')

    await expect(SpotifyLibraryService.saveItem('spotify:local:artist:track')).rejects.toThrow(
      'Este conteúdo não pode ser salvo na biblioteca.'
    )
    await expect(
      SpotifyLibraryService.saveItem('https://open.spotify.com/track/id')
    ).rejects.toThrow('Este conteúdo não pode ser salvo na biblioteca.')
    expect(accessTokenSpy).not.toHaveBeenCalled()
  })
})
