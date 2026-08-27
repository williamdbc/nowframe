import type { SpotifyPlaybackState } from '../../../contracts/music-display-api'
import { SpotifyAuthService } from '../authentication/spotify-auth-service'
import { SpotifyPlaybackClient } from './spotify-playback-client'

export class SpotifyPlaybackService {
  static async getCurrentPlayback(): Promise<SpotifyPlaybackState | null> {
    const accessToken = await SpotifyAuthService.getAccessToken()

    if (!accessToken) {
      throw new Error('A sessão do Spotify expirou. Conecte sua conta novamente.')
    }

    return SpotifyPlaybackClient.getCurrentPlayback(accessToken)
  }
}
