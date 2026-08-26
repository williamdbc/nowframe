import { BrowserWindow, ipcMain } from 'electron'
import type { IpcMainInvokeEvent } from 'electron'

import { ipcChannels, type WindowState } from '../../contracts/music-display-api'

function getSenderWindow(event: IpcMainInvokeEvent): BrowserWindow {
  const senderWindow = BrowserWindow.fromWebContents(event.sender)

  if (!senderWindow) {
    throw new Error('The renderer is not attached to a window.')
  }

  return senderWindow
}

function getWindowState(window: BrowserWindow): WindowState {
  return {
    isFullScreen: window.isFullScreen()
  }
}

function waitForFullScreenTransition(
  window: BrowserWindow,
  isFullScreen: boolean
): Promise<WindowState> {
  if (window.isFullScreen() === isFullScreen) {
    return Promise.resolve(getWindowState(window))
  }

  return new Promise((resolve) => {
    const resolveWithCurrentState = (): void => resolve(getWindowState(window))

    if (isFullScreen) {
      window.once('enter-full-screen', resolveWithCurrentState)
    } else {
      window.once('leave-full-screen', resolveWithCurrentState)
    }

    window.setFullScreen(isFullScreen)
  })
}

export function registerWindowIpcHandlers(): void {
  ipcMain.handle(ipcChannels.getWindowState, (event) => getWindowState(getSenderWindow(event)))

  ipcMain.handle(ipcChannels.setWindowFullScreen, (event, isFullScreen: unknown) => {
    if (typeof isFullScreen !== 'boolean') {
      throw new TypeError('Window fullscreen state must be a boolean.')
    }

    return waitForFullScreenTransition(getSenderWindow(event), isFullScreen)
  })
}
