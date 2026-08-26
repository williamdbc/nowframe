export const ipcChannels = {
  getAppBootstrapState: 'app:get-bootstrap-state',
  getSpotifySession: 'spotify:get-session',
  getSpotifyProfile: 'spotify:get-profile',
  loginWithSpotify: 'spotify:login',
  logoutFromSpotify: 'spotify:logout',
  getWindowState: 'window:get-state',
  setWindowFullScreen: 'window:set-full-screen',
  windowStateChanged: 'window:state-changed'
} as const

export interface AppBootstrapState {
  appName: string
  appVersion: string
  spotify: {
    isConfigured: boolean
    redirectUri: string
  }
}

export interface WindowState {
  isFullScreen: boolean
}

export type SpotifySessionState =
  | {
      status: 'authenticated'
    }
  | {
      status: 'unauthenticated'
    }

export interface SpotifyProfile {
  accountId: string
  displayName: string | null
  imageUrl: string | null
  profileUrl: string
}

export interface MusicDisplayApi {
  app: {
    getBootstrapState: () => Promise<AppBootstrapState>
  }
  spotify: {
    getSession: () => Promise<SpotifySessionState>
    getProfile: () => Promise<SpotifyProfile>
    login: () => Promise<SpotifySessionState>
    logout: () => Promise<SpotifySessionState>
  }
  window: {
    getState: () => Promise<WindowState>
    setFullScreen: (isFullScreen: boolean) => Promise<WindowState>
    onStateChanged: (listener: (state: WindowState) => void) => () => void
  }
}
