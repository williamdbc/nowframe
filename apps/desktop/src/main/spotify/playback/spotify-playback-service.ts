import type {
  SpotifyPlaybackQueue,
  SpotifyPlaybackState,
  SpotifyRepeatMode
} from '../../../contracts/nowframe-api'
import { SpotifyAuthService } from '../authentication/spotify-auth-service'
import { SpotifyPlaybackClient } from './spotify-playback-client'

export class SpotifyPlaybackService {
  static async getCurrentPlayback(): Promise<SpotifyPlaybackState | null> {
    return SpotifyPlaybackClient.getCurrentPlayback(await this.getAccessToken())
  }

  static async getQueue(): Promise<SpotifyPlaybackQueue> {
    return SpotifyPlaybackClient.getQueue(await this.getAccessToken())
  }

  static async pause(): Promise<void> {
    return SpotifyPlaybackClient.pause(await this.getAccessToken())
  }

  static async resume(): Promise<void> {
    return SpotifyPlaybackClient.resume(await this.getAccessToken())
  }

  static async playContextTrack(contextUri: unknown, position: unknown): Promise<void> {
    if (
      typeof contextUri !== 'string' ||
      (!contextUri.startsWith('spotify:album:') && !contextUri.startsWith('spotify:playlist:'))
    ) {
      throw new Error('O contexto de reprodução selecionado é inválido.')
    }

    if (typeof position !== 'number' || !Number.isSafeInteger(position) || position < 0) {
      throw new Error('A posição da faixa selecionada é inválida.')
    }

    return SpotifyPlaybackClient.playContextTrack(await this.getAccessToken(), contextUri, position)
  }

  static async seek(positionMs: unknown): Promise<void> {
    if (typeof positionMs !== 'number' || !Number.isSafeInteger(positionMs) || positionMs < 0) {
      throw new Error('A posição da reprodução é inválida.')
    }

    return SpotifyPlaybackClient.seek(await this.getAccessToken(), positionMs)
  }

  static async setVolume(volumePercent: unknown): Promise<void> {
    if (
      typeof volumePercent !== 'number' ||
      !Number.isSafeInteger(volumePercent) ||
      volumePercent < 0 ||
      volumePercent > 100
    ) {
      throw new Error('O volume deve ser um número inteiro entre 0 e 100.')
    }

    return SpotifyPlaybackClient.setVolume(await this.getAccessToken(), volumePercent)
  }

  static async setRepeatMode(repeatMode: unknown): Promise<void> {
    if (repeatMode !== 'context' && repeatMode !== 'off' && repeatMode !== 'track') {
      throw new Error('O modo de repetição é inválido.')
    }

    return SpotifyPlaybackClient.setRepeatMode(
      await this.getAccessToken(),
      repeatMode satisfies SpotifyRepeatMode
    )
  }

  static async setShuffle(enabled: unknown): Promise<void> {
    if (typeof enabled !== 'boolean') throw new Error('O modo aleatório é inválido.')
    return SpotifyPlaybackClient.setShuffle(await this.getAccessToken(), enabled)
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
