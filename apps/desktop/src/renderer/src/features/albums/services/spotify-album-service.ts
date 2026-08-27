import { normalizeIpcError } from '@/shared/utils/normalize-ipc-error'

export class SpotifyAlbumService {
  static async getTracks(
    albumId: string
  ): ReturnType<typeof window.musicDisplay.spotify.getAlbumTracks> {
    try {
      return await window.musicDisplay.spotify.getAlbumTracks(albumId)
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível carregar as faixas deste álbum.')
    }
  }
}
