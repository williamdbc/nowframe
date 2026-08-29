import { AmbientPlayerTheme } from '@/features/themes/variants/ambient/ambient-player-theme'
import { ArcadeSelectPlayerTheme } from '@/features/themes/variants/arcade-select/arcade-select-player-theme'
import { CassettePlayerTheme } from '@/features/themes/variants/cassette/cassette-player-theme'
import { CdCoverPlayerTheme } from '@/features/themes/variants/cd-cover/cd-cover-player-theme'
import { DefaultPlayerTheme } from '@/features/themes/variants/default/default-player-theme'
import { DrivePlayerTheme } from '@/features/themes/variants/drive/drive-player-theme'
import { FilmStripPlayerTheme } from '@/features/themes/variants/film-strip/film-strip-player-theme'
import { HiFiRackPlayerTheme } from '@/features/themes/variants/hi-fi-rack/hi-fi-rack-player-theme'
import { KaraokePlayerTheme } from '@/features/themes/variants/karaoke/karaoke-player-theme'
import { JukeboxPlayerTheme } from '@/features/themes/variants/jukebox/jukebox-player-theme'
import { LyricsPlayerTheme } from '@/features/themes/variants/lyrics/lyrics-player-theme'
import { MinimalistPlayerTheme } from '@/features/themes/variants/minimalist/minimalist-player-theme'
import { OrbitPlayerTheme } from '@/features/themes/variants/orbit/orbit-player-theme'
import { MetroLinePlayerTheme } from '@/features/themes/variants/metro-line/metro-line-player-theme'
import { MiniDiscDeckPlayerTheme } from '@/features/themes/variants/minidisc-deck/minidisc-deck-player-theme'
import { PosterPlayerTheme } from '@/features/themes/variants/poster/poster-player-theme'
import { RecordCratePlayerTheme } from '@/features/themes/variants/record-crate/record-crate-player-theme'
import { RocketLeaguePlayerTheme } from '@/features/themes/variants/rocket-league/rocket-league-player-theme'
import { SetlistPlayerTheme } from '@/features/themes/variants/setlist/setlist-player-theme'
import { SpotlightPlayerTheme } from '@/features/themes/variants/spotlight/spotlight-player-theme'
import { TracklistPlayerTheme } from '@/features/themes/variants/tracklist/tracklist-player-theme'
import { TimelinePlayerTheme } from '@/features/themes/variants/timeline/timeline-player-theme'

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
  'film-strip': {
    id: 'film-strip',
    name: 'Film Strip',
    component: FilmStripPlayerTheme,
    usesTracklist: true
  },
  'hi-fi-rack': {
    id: 'hi-fi-rack',
    name: 'Hi-Fi Rack',
    component: HiFiRackPlayerTheme,
    usesTracklist: true
  },
  karaoke: {
    id: 'karaoke',
    name: 'Karaoke',
    component: KaraokePlayerTheme
  },
  jukebox: {
    id: 'jukebox',
    name: 'Jukebox',
    component: JukeboxPlayerTheme,
    usesTracklist: true
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
  orbit: {
    id: 'orbit',
    name: 'Orbit',
    component: OrbitPlayerTheme,
    usesTracklist: true
  },
  'metro-line': {
    id: 'metro-line',
    name: 'Metro Line',
    component: MetroLinePlayerTheme,
    usesTracklist: true
  },
  'minidisc-deck': {
    id: 'minidisc-deck',
    name: 'MiniDisc Deck',
    component: MiniDiscDeckPlayerTheme,
    usesTracklist: true
  },
  poster: {
    id: 'poster',
    name: 'Poster',
    component: PosterPlayerTheme
  },
  'record-crate': {
    id: 'record-crate',
    name: 'Record Crate',
    component: RecordCratePlayerTheme,
    usesTracklist: true
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
  },
  timeline: {
    id: 'timeline',
    name: 'Timeline',
    component: TimelinePlayerTheme,
    usesTracklist: true
  }
} as const satisfies Record<PlayerThemeId, PlayerTheme>

export const availableThemes = Object.values(themeRegistry)

export function isPlayerThemeId(value: string): value is PlayerThemeId {
  return value in themeRegistry
}
