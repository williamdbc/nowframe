import { ipcMain } from 'electron'

import { ipcChannels } from '../../contracts/nowframe-api'
import { LyricsService } from '../lyrics/lyrics-service'

export function registerLyricsIpcHandlers(): void {
  ipcMain.handle(ipcChannels.getLyrics, (_event, query: unknown) => LyricsService.get(query))
}
