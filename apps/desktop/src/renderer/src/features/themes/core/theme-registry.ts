import { AmbientPlayerTheme } from '@/features/themes/variants/ambient/ambient-player-theme'
import { DefaultPlayerTheme } from '@/features/themes/variants/default/default-player-theme'
import { DrivePlayerTheme } from '@/features/themes/variants/drive/drive-player-theme'
import { KaraokePlayerTheme } from '@/features/themes/variants/karaoke/karaoke-player-theme'
import { LyricsPlayerTheme } from '@/features/themes/variants/lyrics/lyrics-player-theme'
import { MinimalistPlayerTheme } from '@/features/themes/variants/minimalist/minimalist-player-theme'
import { TracklistPlayerTheme } from '@/features/themes/variants/tracklist/tracklist-player-theme'

import type { PlayerTheme, PlayerThemeId } from './types/player-theme'

export const defaultThemeId = 'default'

export const themeRegistry = {
  ambient: {
    id: 'ambient',
    name: 'Ambient',
    component: AmbientPlayerTheme
  },
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
  karaoke: {
    id: 'karaoke',
    name: 'Karaoke',
    component: KaraokePlayerTheme
  },
  lyrics: {
    id: 'lyrics',
    name: 'Lyrics',
    component: LyricsPlayerTheme
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
