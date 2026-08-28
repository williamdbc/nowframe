import type { SpotifyLibraryItemState } from '../../../contracts/nowframe-api'
import { SpotifyAuthService } from '../authentication/spotify-auth-service'
import { SpotifyLibraryClient } from './spotify-library-client'

const supportedLibraryItemUri = /^spotify:(?:episode|track):[A-Za-z0-9]+$/

function validateLibraryItemUri(uri: unknown): string {
  if (typeof uri !== 'string' || !supportedLibraryItemUri.test(uri)) {
    throw new Error('Este conteúdo não pode ser salvo na biblioteca.')
  }

  return uri
}

export class SpotifyLibraryService {
  static async getItemState(uri: unknown): Promise<SpotifyLibraryItemState> {
    const validUri = validateLibraryItemUri(uri)
    return SpotifyLibraryClient.getItemState(await this.getAccessToken(), validUri)
  }

  static async saveItem(uri: unknown): Promise<void> {
    const validUri = validateLibraryItemUri(uri)
    return SpotifyLibraryClient.saveItem(await this.getAccessToken(), validUri)
  }

  static async removeItem(uri: unknown): Promise<void> {
    const validUri = validateLibraryItemUri(uri)
    return SpotifyLibraryClient.removeItem(await this.getAccessToken(), validUri)
  }

  private static async getAccessToken(): Promise<string> {
    const accessToken = await SpotifyAuthService.getAccessToken()

    if (!accessToken) {
      throw new Error('A sessão do Spotify expirou. Conecte sua conta novamente.')
    }

    return accessToken
  }
}
