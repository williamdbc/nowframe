import type { SpotifyPlaybackState } from '../../../contracts/music-display-api'
import { SpotifyAuthService } from '../authentication/spotify-auth-service'
import { SpotifyPlaybackClient } from './spotify-playback-client'

export class SpotifyPlaybackService {
  static async getCurrentPlayback(): Promise<SpotifyPlaybackState | null> {
    return SpotifyPlaybackClient.getCurrentPlayback(await this.getAccessToken())
  }

  static async pause(): Promise<void> {
    return SpotifyPlaybackClient.pause(await this.getAccessToken())
  }

  static async resume(): Promise<void> {
    return SpotifyPlaybackClient.resume(await this.getAccessToken())
  }

  static async skipToNext(): Promise<void> {
    return SpotifyPlaybackClient.skipToNext(await this.getAccessToken())
  }

  static async skipToPrevious(): Promise<void> {
    return SpotifyPlaybackClient.skipToPrevious(await this.getAccessToken())
  }

  private static async getAccessToken(): Promise<string> {
    const accessToken = await SpotifyAuthService.getAccessToken()

    if (!accessToken) {
      throw new Error('A sessão do Spotify expirou. Conecte sua conta novamente.')
    }

    return accessToken
  }
}
