import { app, ipcMain } from 'electron'

import { ipcChannels, type AppBootstrapState } from '../../contracts/nowframe-api'
import { getSpotifyRedirectUri, isSpotifyConfigured } from '../config/spotify-environment'

export function registerAppIpcHandlers(): void {
  ipcMain.handle(ipcChannels.getAppBootstrapState, (): AppBootstrapState => ({
    appName: app.getName(),
    appVersion: app.getVersion(),
    spotify: {
      isConfigured: isSpotifyConfigured(),
      redirectUri: getSpotifyRedirectUri()
    }
  }))
}
