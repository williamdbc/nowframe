import type { SpotifyRepeatMode } from '../../../../../contracts/music-display-api'

export type PlaybackOptionCommand =
  | {
      enabled: boolean
      type: 'shuffle'
    }
  | {
      repeatMode: SpotifyRepeatMode
      type: 'repeat'
    }
