import type { ComponentType, ReactNode } from 'react'

import type { PlaybackLoadStatus, PlaybackState } from '@/features/playback/types/playback-state'

export interface PlaybackControls {
  errorMessage: string | null
  isCommandPending: boolean
  isSeekPending: boolean
  isVolumePending: boolean
  onNext: () => void
  onPauseOrResume: () => void
  onPrevious: () => void
  onSeek: (positionMs: number) => void
  onCommitVolume: (volumePercent: number) => Promise<void>
  onSetVolume: (volumePercent: number) => void
  onToggleMute: () => void
}

export interface PlayerThemeChrome {
  accountMenu: ReactNode
  connectionStatus: ReactNode
  fullscreenControl: ReactNode
  themeSelector: ReactNode
}

export interface PlayerThemeProps {
  chrome: PlayerThemeChrome
  controls: PlaybackControls
  playback: PlaybackState | null
  playbackStatus: PlaybackLoadStatus
}

export type PlayerThemeId = 'default' | 'drive' | 'minimalist'

export interface PlayerTheme {
  id: PlayerThemeId
  name: string
  component: ComponentType<PlayerThemeProps>
}
