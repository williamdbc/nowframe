import { DefaultPlayerTheme } from '@/features/themes/variants/default/default-player-theme'
import { DrivePlayerTheme } from '@/features/themes/variants/drive/drive-player-theme'
import { MinimalistPlayerTheme } from '@/features/themes/variants/minimalist/minimalist-player-theme'
import { TracklistPlayerTheme } from '@/features/themes/variants/tracklist/tracklist-player-theme'

import type { PlayerTheme, PlayerThemeId } from './types/player-theme'

export const defaultThemeId = 'default'

export const themeRegistry = {
  default: {
    id: defaultThemeId,
    name: 'Default',
    component: DefaultPlayerTheme
  },
  drive: {
    id: 'drive',
    name: 'Drive',
    component: DrivePlayerTheme
  },
  minimalist: {
    id: 'minimalist',
    name: 'Minimalist',
    component: MinimalistPlayerTheme
  },
  tracklist: {
    id: 'tracklist',
    name: 'Tracklist',
    component: TracklistPlayerTheme
  }
} as const satisfies Record<PlayerThemeId, PlayerTheme>

export const availableThemes = Object.values(themeRegistry)

export function isPlayerThemeId(value: string): value is PlayerThemeId {
  return value in themeRegistry
}
