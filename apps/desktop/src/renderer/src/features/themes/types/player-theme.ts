import type { ComponentType } from 'react'

import type { PlaybackLoadStatus, PlaybackState } from '@/features/playback/types/playback-state'

export interface PlaybackControls {
  errorMessage: string | null
  isPending: boolean
  onNext: () => void
  onPauseOrResume: () => void
  onPrevious: () => void
}

export interface PlayerThemeProps {
  controls: PlaybackControls
  playback: PlaybackState | null
  playbackStatus: PlaybackLoadStatus
}

export interface PlayerTheme {
  id: string
  name: string
  component: ComponentType<PlayerThemeProps>
}
