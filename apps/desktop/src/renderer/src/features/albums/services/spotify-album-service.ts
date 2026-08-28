import { normalizeIpcError } from '@/shared/utils/normalize-ipc-error'

export class SpotifyAlbumService {
  static async getTracks(
    albumId: string
  ): ReturnType<typeof window.nowframe.spotify.getAlbumTracks> {
    try {
      return await window.nowframe.spotify.getAlbumTracks(albumId)
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível carregar as faixas deste álbum.')
    }
  }
}
