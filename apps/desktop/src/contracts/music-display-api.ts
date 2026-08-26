export const ipcChannels = {
  getAppBootstrapState: 'app:get-bootstrap-state'
} as const

export interface AppBootstrapState {
  appName: string
  appVersion: string
  spotify: {
    isConfigured: boolean
    redirectUri: string
  }
}

export interface MusicDisplayApi {
  app: {
    getBootstrapState: () => Promise<AppBootstrapState>
  }
}
