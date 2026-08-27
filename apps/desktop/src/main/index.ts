import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'

import { registerAppIpcHandlers } from './ipc/register-app-ipc-handlers'
import { registerLyricsIpcHandlers } from './ipc/register-lyrics-ipc-handlers'
import { registerSpotifyIpcHandlers } from './ipc/register-spotify-ipc-handlers'
import { registerWindowIpcHandlers } from './ipc/register-window-ipc-handlers'
import { createMainWindow } from './windows/create-main-window'

void app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.musicdisplay.desktop')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerAppIpcHandlers()
  registerLyricsIpcHandlers()
  registerSpotifyIpcHandlers()
  registerWindowIpcHandlers()
  createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
