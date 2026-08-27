import { contextBridge, ipcRenderer } from 'electron'
import type { IpcRendererEvent } from 'electron'

import { ipcChannels, type MusicDisplayApi, type WindowState } from '../contracts/music-display-api'

const musicDisplayApi: MusicDisplayApi = {
  app: {
    getBootstrapState: () => ipcRenderer.invoke(ipcChannels.getAppBootstrapState)
  },
  spotify: {
    getSession: () => ipcRenderer.invoke(ipcChannels.getSpotifySession),
    getProfile: () => ipcRenderer.invoke(ipcChannels.getSpotifyProfile),
    getPlayback: () => ipcRenderer.invoke(ipcChannels.getSpotifyPlayback),
    login: () => ipcRenderer.invoke(ipcChannels.loginWithSpotify),
    logout: () => ipcRenderer.invoke(ipcChannels.logoutFromSpotify)
  },
  window: {
    getState: () => ipcRenderer.invoke(ipcChannels.getWindowState),
    setFullScreen: (isFullScreen) =>
      ipcRenderer.invoke(ipcChannels.setWindowFullScreen, isFullScreen),
    onStateChanged: (listener) => {
      const ipcListener = (_event: IpcRendererEvent, state: WindowState): void => listener(state)

      ipcRenderer.on(ipcChannels.windowStateChanged, ipcListener)

      return () => ipcRenderer.removeListener(ipcChannels.windowStateChanged, ipcListener)
    }
  }
}

contextBridge.exposeInMainWorld('musicDisplay', musicDisplayApi)
