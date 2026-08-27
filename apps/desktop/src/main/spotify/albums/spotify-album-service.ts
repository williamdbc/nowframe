import type { SpotifyAlbumTracklist } from '../../../contracts/music-display-api'
import { SpotifyAuthService } from '../authentication/spotify-auth-service'
import { SpotifyAlbumClient } from './spotify-album-client'

export class SpotifyAlbumService {
  static async getTracks(albumId: unknown): Promise<SpotifyAlbumTracklist> {
    if (typeof albumId !== 'string' || !/^[A-Za-z0-9]+$/.test(albumId)) {
      throw new Error('O identificador do álbum é inválido.')
    }

    const accessToken = await SpotifyAuthService.getAccessToken()

    if (!accessToken) {
      throw new Error('A sessão do Spotify expirou. Conecte sua conta novamente.')
    }

    return SpotifyAlbumClient.getTracks(accessToken, albumId)
  }
}
