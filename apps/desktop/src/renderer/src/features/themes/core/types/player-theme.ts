import type { ComponentType, ReactNode } from 'react'

import type { PlaybackLoadStatus, PlaybackState } from '@/features/playback/types/playback-state'
import type { SpotifyTracklistTrack } from '../../../../../../contracts/music-display-api'

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
  playback: PlaybackState | null
  playbackStatus: PlaybackLoadStatus
  tracklist: PlayerThemeTracklist
}

export type PlayerThemeId = 'default' | 'drive' | 'minimalist' | 'tracklist'

export interface PlayerTheme {
  id: PlayerThemeId
  name: string
  component: ComponentType<PlayerThemeProps>
}
