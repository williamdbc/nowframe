import { normalizeIpcError } from '@/shared/utils/normalize-ipc-error'

export class SpotifyLibraryService {
  static async getItemState(
    uri: string
  ): ReturnType<typeof window.nowframe.spotify.getLibraryItemState> {
    try {
      return await window.nowframe.spotify.getLibraryItemState(uri)
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível consultar a biblioteca do Spotify.')
    }
  }

  static async saveItem(uri: string): ReturnType<typeof window.nowframe.spotify.saveLibraryItem> {
    try {
      return await window.nowframe.spotify.saveLibraryItem(uri)
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível adicionar o conteúdo à biblioteca.')
    }
  }

  static async removeItem(
    uri: string
  ): ReturnType<typeof window.nowframe.spotify.removeLibraryItem> {
    try {
      return await window.nowframe.spotify.removeLibraryItem(uri)
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível remover o conteúdo da biblioteca.')
    }
  }
}
