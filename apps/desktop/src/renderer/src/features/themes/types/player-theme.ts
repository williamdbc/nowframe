import type { ComponentType } from 'react'

import type { PlaybackState } from '@/features/playback/types/playback-state'

export interface PlayerThemeProps {
  playback: PlaybackState | null
}

export interface PlayerTheme {
  id: string
  name: string
  component: ComponentType<PlayerThemeProps>
}
