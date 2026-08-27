import { normalizeIpcError } from '@/shared/utils/normalize-ipc-error'

export class SpotifyPlaybackService {
  static async getCurrentPlayback(): ReturnType<typeof window.musicDisplay.spotify.getPlayback> {
    try {
      return await window.musicDisplay.spotify.getPlayback()
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível sincronizar a reprodução do Spotify.')
    }
  }
}
