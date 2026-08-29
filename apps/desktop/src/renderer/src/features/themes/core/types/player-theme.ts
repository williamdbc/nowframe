import type { ComponentType, ReactNode } from 'react'

import type { PlaybackLoadStatus, PlaybackState } from '@/features/playback/types/playback-state'
import type { LyricsDisplayState } from '@/features/lyrics/types/lyrics-display-state'
import type { SpotifyTracklistTrack } from '../../../../../../contracts/nowframe-api'

export interface PlaybackControls {
  canToggleSaved: boolean
  errorMessage: string | null
  isCommandPending: boolean
  isLibraryPending: boolean
  isPlaybackOptionPending: boolean
  isSaved: boolean
  isSeekPending: boolean
  isVolumePending: boolean
  onCycleRepeat: () => void
  onNext: () => void
  onPauseOrResume: () => void
  onPrevious: () => void
  onSeek: (positionMs: number) => void
  onCommitVolume: (volumePercent: number) => Promise<void>
  onSetVolume: (volumePercent: number) => void
  onToggleSaved: () => void
  onToggleShuffle: () => void
  onToggleMute: () => void
}

export interface PlayerThemeChrome {
  accountMenu: ReactNode
  connectionStatus: ReactNode
  fullscreenControl: ReactNode
  themeSelector: ReactNode
}

export interface PlayerThemeTracklist {
  contextImageUrl: string | null
  contextName: string
  isPending: boolean
  isPlayPending: boolean
  onPlayTrack: (track: SpotifyTracklistTrack) => void
  tracks: readonly SpotifyTracklistTrack[]
}

export interface PlayerThemeProps {
  chrome: PlayerThemeChrome
  controls: PlaybackControls
  isFullScreen: boolean
  onExitFullScreen: () => void
  lyrics: LyricsDisplayState
  playback: PlaybackState | null
  playbackStatus: PlaybackLoadStatus
  tracklist: PlayerThemeTracklist
}

export type PlayerThemeId =
  | 'ambient'
  | 'cd-cover'
  | 'default'
  | 'drive'
  | 'karaoke'
  | 'lyrics'
  | 'minimalist'
  | 'poster'
  | 'spotlight'
  | 'tracklist'
  | 'vinyl'

export interface PlayerTheme {
  id: PlayerThemeId
  name: string
  component: ComponentType<PlayerThemeProps>
}
