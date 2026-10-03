import { BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

import icon from '../../../resources/icon.png?asset'
import { ipcChannels, type WindowState } from '../../contracts/nowframe-api'
import { getWindowChromeOptions } from './window-chrome-options'

export function createMainWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 900,
    minHeight: 540,
    show: false,
    title: 'Nowframe',
    backgroundColor: '#08090a',
    autoHideMenuBar: true,
    ...getWindowChromeOptions(process.platform),
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow.show())

  const notifyWindowStateChanged = (): void => {
    const state: WindowState = {
      isFullScreen: mainWindow.isFullScreen()
    }

    mainWindow.webContents.send(ipcChannels.windowStateChanged, state)
  }

  mainWindow.on('enter-full-screen', notifyWindowStateChanged)
  mainWindow.on('leave-full-screen', notifyWindowStateChanged)

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    const target = new URL(url)

    if (target.protocol === 'https:') void shell.openExternal(url)

    return { action: 'deny' }
  })

  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    void mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}
