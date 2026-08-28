import type { LyricsQuery } from '../../../../../contracts/nowframe-api'
import { normalizeIpcError } from '@/shared/utils/normalize-ipc-error'

export class LyricsService {
  static async get(query: LyricsQuery): ReturnType<typeof window.nowframe.lyrics.get> {
    try {
      return await window.nowframe.lyrics.get(query)
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível carregar a letra desta música.')
    }
  }
}
