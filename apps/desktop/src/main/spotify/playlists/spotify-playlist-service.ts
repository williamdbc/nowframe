import type { SpotifyPlaylistTracklist } from '../../../contracts/nowframe-api'
import { SpotifyAuthService } from '../authentication/spotify-auth-service'
import { SpotifyPlaylistClient } from './spotify-playlist-client'

export class SpotifyPlaylistService {
  static async getTracks(playlistId: unknown): Promise<SpotifyPlaylistTracklist> {
    if (typeof playlistId !== 'string' || !/^[A-Za-z0-9]+$/.test(playlistId)) {
      throw new Error('O identificador da playlist é inválido.')
    }

    const accessToken = await SpotifyAuthService.getAccessToken()

    if (!accessToken) {
      throw new Error('A sessão do Spotify expirou. Conecte sua conta novamente.')
    }

    return SpotifyPlaylistClient.getTracks(accessToken, playlistId)
  }
}
