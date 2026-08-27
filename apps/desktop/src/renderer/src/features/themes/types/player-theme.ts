import type { ComponentType } from 'react'

import type { PlaybackLoadStatus, PlaybackState } from '@/features/playback/types/playback-state'

export interface PlayerThemeProps {
  playback: PlaybackState | null
  playbackStatus: PlaybackLoadStatus
}

export interface PlayerTheme {
  id: string
  name: string
  component: ComponentType<PlayerThemeProps>
}
