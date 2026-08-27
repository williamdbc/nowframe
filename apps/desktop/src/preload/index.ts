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
    getLibraryItemState: (uri) => ipcRenderer.invoke(ipcChannels.getSpotifyLibraryItemState, uri),
    pausePlayback: () => ipcRenderer.invoke(ipcChannels.pauseSpotifyPlayback),
    removeLibraryItem: (uri) => ipcRenderer.invoke(ipcChannels.removeSpotifyLibraryItem, uri),
    resumePlayback: () => ipcRenderer.invoke(ipcChannels.resumeSpotifyPlayback),
    saveLibraryItem: (uri) => ipcRenderer.invoke(ipcChannels.saveSpotifyLibraryItem, uri),
    seekPlayback: (positionMs) => ipcRenderer.invoke(ipcChannels.seekSpotifyPlayback, positionMs),
    setPlaybackRepeatMode: (repeatMode) =>
      ipcRenderer.invoke(ipcChannels.setSpotifyPlaybackRepeatMode, repeatMode),
    setPlaybackShuffle: (enabled) =>
      ipcRenderer.invoke(ipcChannels.setSpotifyPlaybackShuffle, enabled),
    setPlaybackVolume: (volumePercent) =>
      ipcRenderer.invoke(ipcChannels.setSpotifyPlaybackVolume, volumePercent),
    skipPlaybackToNext: () => ipcRenderer.invoke(ipcChannels.skipSpotifyPlaybackToNext),
    skipPlaybackToPrevious: () => ipcRenderer.invoke(ipcChannels.skipSpotifyPlaybackToPrevious),
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
