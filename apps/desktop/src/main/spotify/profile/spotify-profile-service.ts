import type { SpotifyProfile } from '../../../contracts/music-display-api'
import { SpotifyAuthService } from '../authentication/spotify-auth-service'
import { SpotifyProfileClient } from './spotify-profile-client'

export class SpotifyProfileService {
  static async getCurrentProfile(): Promise<SpotifyProfile> {
    const accessToken = await SpotifyAuthService.getAccessToken()

    if (!accessToken) {
      throw new Error('A sessão do Spotify expirou. Conecte sua conta novamente.')
    }

    return SpotifyProfileClient.getCurrentProfile(accessToken)
  }
}
