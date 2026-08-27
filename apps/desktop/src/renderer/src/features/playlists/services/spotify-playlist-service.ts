import { normalizeIpcError } from '@/shared/utils/normalize-ipc-error'

export class SpotifyPlaylistService {
  static async getTracks(
    playlistId: string
  ): ReturnType<typeof window.musicDisplay.spotify.getPlaylistTracks> {
    try {
      return await window.musicDisplay.spotify.getPlaylistTracks(playlistId)
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível carregar as faixas desta playlist.')
    }
  }
}
