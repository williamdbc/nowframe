import type { LyricsQuery } from '../../../../../contracts/music-display-api'
import { normalizeIpcError } from '@/shared/utils/normalize-ipc-error'

export class LyricsService {
  static async get(query: LyricsQuery): ReturnType<typeof window.musicDisplay.lyrics.get> {
    try {
      return await window.musicDisplay.lyrics.get(query)
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível carregar a letra desta música.')
    }
  }
}
