export const ipcChannels = {
  getAppBootstrapState: 'app:get-bootstrap-state',
  getSpotifySession: 'spotify:get-session',
  getSpotifyProfile: 'spotify:get-profile',
  getSpotifyPlayback: 'spotify:get-playback',
  getSpotifyLibraryItemState: 'spotify:get-library-item-state',
  pauseSpotifyPlayback: 'spotify:pause-playback',
  removeSpotifyLibraryItem: 'spotify:remove-library-item',
  resumeSpotifyPlayback: 'spotify:resume-playback',
  saveSpotifyLibraryItem: 'spotify:save-library-item',
  seekSpotifyPlayback: 'spotify:seek-playback',
  setSpotifyPlaybackRepeatMode: 'spotify:set-playback-repeat-mode',
  setSpotifyPlaybackShuffle: 'spotify:set-playback-shuffle',
  setSpotifyPlaybackVolume: 'spotify:set-playback-volume',
  skipSpotifyPlaybackToNext: 'spotify:skip-playback-to-next',
  skipSpotifyPlaybackToPrevious: 'spotify:skip-playback-to-previous',
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

export interface SpotifyPlaybackDevice {
  id: string | null
  isRestricted: boolean
  name: string
  supportsVolume: boolean
  type: string
  volumePercent: number | null
}

export interface SpotifyPlaybackItem {
  collectionName: string
  creatorNames: string[]
  durationMs: number
  id: string | null
  imageUrl: string | null
  title: string
  type: 'episode' | 'track'
  uri: string | null
}

export type SpotifyRepeatMode = 'context' | 'off' | 'track'

export interface SpotifyPlaybackState {
  capabilities: {
    canPause: boolean
    canResume: boolean
    canSeek: boolean
    canSetVolume: boolean
    canSkipNext: boolean
    canSkipPrevious: boolean
    canToggleRepeat: boolean
    canToggleShuffle: boolean
  }
  device: SpotifyPlaybackDevice
  isPlaying: boolean
  item: SpotifyPlaybackItem | null
  progressMs: number
  repeatMode: SpotifyRepeatMode
  shuffleEnabled: boolean
  synchronizedAt: number
}

export interface SpotifyLibraryItemState {
  isSaved: boolean
  uri: string
}

export interface MusicDisplayApi {
  app: {
    getBootstrapState: () => Promise<AppBootstrapState>
  }
  spotify: {
    getSession: () => Promise<SpotifySessionState>
    getProfile: () => Promise<SpotifyProfile>
    getPlayback: () => Promise<SpotifyPlaybackState | null>
    getLibraryItemState: (uri: string) => Promise<SpotifyLibraryItemState>
    pausePlayback: () => Promise<void>
    removeLibraryItem: (uri: string) => Promise<void>
    resumePlayback: () => Promise<void>
    saveLibraryItem: (uri: string) => Promise<void>
    seekPlayback: (positionMs: number) => Promise<void>
    setPlaybackRepeatMode: (repeatMode: SpotifyRepeatMode) => Promise<void>
    setPlaybackShuffle: (enabled: boolean) => Promise<void>
    setPlaybackVolume: (volumePercent: number) => Promise<void>
    skipPlaybackToNext: () => Promise<void>
    skipPlaybackToPrevious: () => Promise<void>
    login: () => Promise<SpotifySessionState>
    logout: () => Promise<SpotifySessionState>
  }
  window: {
    getState: () => Promise<WindowState>
    setFullScreen: (isFullScreen: boolean) => Promise<WindowState>
    onStateChanged: (listener: (state: WindowState) => void) => () => void
  }
}
