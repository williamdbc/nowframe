import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'

import { registerAppIpcHandlers } from './ipc/register-app-ipc-handlers'
import { createMainWindow } from './windows/create-main-window'

void app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.musicdisplay.desktop')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerAppIpcHandlers()
  createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
