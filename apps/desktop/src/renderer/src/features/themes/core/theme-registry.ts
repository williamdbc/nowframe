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
import { VinylPlayerTheme } from '@/features/themes/variants/vinyl/vinyl-player-theme'

import type { PlayerTheme, PlayerThemeId } from './types/player-theme'

export const defaultThemeId = 'default'

export const themeRegistry = {
  ambient: {
    id: 'ambient',
    name: 'Ambient',
    category: 'main',
    component: AmbientPlayerTheme
  },
  'arcade-select': {
    id: 'arcade-select',
    name: 'Arcade Select',
    category: 'conceptual',
    component: ArcadeSelectPlayerTheme,
    usesTracklist: true
  },
  cassette: {
    id: 'cassette',
    name: 'Cassette',
    category: 'conceptual',
    component: CassettePlayerTheme
  },
  'cd-cover': {
    id: 'cd-cover',
    name: 'CD Cover',
    category: 'main',
    component: CdCoverPlayerTheme
  },
  default: {
    id: defaultThemeId,
    name: 'Default',
    category: 'main',
    component: DefaultPlayerTheme
  },
  drive: {
    id: 'drive',
    name: 'Drive',
    category: 'main',
    component: DrivePlayerTheme
  },
  karaoke: {
    id: 'karaoke',
    name: 'Karaoke',
    category: 'main',
    component: KaraokePlayerTheme
  },
  lyrics: {
    id: 'lyrics',
    name: 'Lyrics',
    category: 'main',
    component: LyricsPlayerTheme
  },
  minimalist: {
    id: 'minimalist',
    name: 'Minimalist',
    category: 'main',
    component: MinimalistPlayerTheme
  },
  poster: {
    id: 'poster',
    name: 'Poster',
    category: 'main',
    component: PosterPlayerTheme
  },
  'rocket-league': {
    id: 'rocket-league',
    name: 'Rocket League',
    category: 'conceptual',
    component: RocketLeaguePlayerTheme
  },
  setlist: {
    id: 'setlist',
    name: 'Setlist',
    category: 'main',
    component: SetlistPlayerTheme,
    usesTracklist: true
  },
  spotlight: {
    id: 'spotlight',
    name: 'Spotlight',
    category: 'main',
    component: SpotlightPlayerTheme
  },
  tracklist: {
    id: 'tracklist',
    name: 'Tracklist',
    category: 'main',
    component: TracklistPlayerTheme,
    usesTracklist: true
  },
  vinyl: {
    id: 'vinyl',
    name: 'Vinyl',
    category: 'main',
    component: VinylPlayerTheme
  }
} as const satisfies Record<PlayerThemeId, PlayerTheme>

export const availableThemes = Object.values(themeRegistry)

export function isPlayerThemeId(value: string): value is PlayerThemeId {
  return value in themeRegistry
}
