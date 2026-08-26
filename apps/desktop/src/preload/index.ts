import { contextBridge, ipcRenderer } from 'electron'

import { ipcChannels, type MusicDisplayApi } from '../contracts/music-display-api'

const musicDisplayApi: MusicDisplayApi = {
  app: {
    getBootstrapState: () => ipcRenderer.invoke(ipcChannels.getAppBootstrapState)
  }
}

contextBridge.exposeInMainWorld('musicDisplay', musicDisplayApi)
