import { normalizeIpcError } from '@/shared/utils/normalize-ipc-error'

export class SpotifyPlaylistService {
  static async getTracks(
    playlistId: string
  ): ReturnType<typeof window.nowframe.spotify.getPlaylistTracks> {
    try {
      return await window.nowframe.spotify.getPlaylistTracks(playlistId)
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível carregar as faixas desta playlist.')
    }
  }
}
