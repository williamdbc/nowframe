import { AmbientPlayerTheme } from '@/features/themes/variants/ambient/ambient-player-theme'
import { ArcadeSelectPlayerTheme } from '@/features/themes/variants/arcade-select/arcade-select-player-theme'
import { CassettePlayerTheme } from '@/features/themes/variants/cassette/cassette-player-theme'
import { CdCoverPlayerTheme } from '@/features/themes/variants/cd-cover/cd-cover-player-theme'
import { DefaultPlayerTheme } from '@/features/themes/variants/default/default-player-theme'
import { DrivePlayerTheme } from '@/features/themes/variants/drive/drive-player-theme'
import { KaraokePlayerTheme } from '@/features/themes/variants/karaoke/karaoke-player-theme'
import { LyricsPlayerTheme } from '@/features/themes/variants/lyrics/lyrics-player-theme'
import { MinimalistPlayerTheme } from '@/features/themes/variants/minimalist/minimalist-player-theme'
import { PosterPlayerTheme } from '@/features/themes/variants/poster/poster-player-theme'
import { RocketLeaguePlayerTheme } from '@/features/themes/variants/rocket-league/rocket-league-player-theme'
import { SetlistPlayerTheme } from '@/features/themes/variants/setlist/setlist-player-theme'
import { SpotlightPlayerTheme } from '@/features/themes/variants/spotlight/spotlight-player-theme'
import { TracklistPlayerTheme } from '@/features/themes/variants/tracklist/tracklist-player-theme'

import type { PlayerTheme, PlayerThemeId } from './types/player-theme'

export const defaultThemeId = 'default'

export const themeRegistry = {
  ambient: {
    id: 'ambient',
    name: 'Ambient',
    component: AmbientPlayerTheme
  },
  'arcade-select': {
    id: 'arcade-select',
    name: 'Arcade Select',
    component: ArcadeSelectPlayerTheme,
    usesTracklist: true
  },
  cassette: {
    id: 'cassette',
    name: 'Cassette',
    component: CassettePlayerTheme
  },
  'cd-cover': {
    id: 'cd-cover',
    name: 'CD Cover',
    component: CdCoverPlayerTheme
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
  poster: {
    id: 'poster',
    name: 'Poster',
    component: PosterPlayerTheme
  },
  'rocket-league': {
    id: 'rocket-league',
    name: 'Rocket League',
    component: RocketLeaguePlayerTheme
  },
  setlist: {
    id: 'setlist',
    name: 'Setlist',
    component: SetlistPlayerTheme,
    usesTracklist: true
  },
  spotlight: {
    id: 'spotlight',
    name: 'Spotlight',
    component: SpotlightPlayerTheme
  },
  tracklist: {
    id: 'tracklist',
    name: 'Tracklist',
    component: TracklistPlayerTheme,
    usesTracklist: true
  }
} as const satisfies Record<PlayerThemeId, PlayerTheme>

export const availableThemes = Object.values(themeRegistry)

export function isPlayerThemeId(value: string): value is PlayerThemeId {
  return value in themeRegistry
}
