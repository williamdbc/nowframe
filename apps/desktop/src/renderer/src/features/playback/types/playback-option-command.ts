import type { SpotifyRepeatMode } from '../../../../../contracts/nowframe-api'

export type PlaybackOptionCommand =
  | {
      enabled: boolean
      type: 'shuffle'
    }
  | {
      repeatMode: SpotifyRepeatMode
      type: 'repeat'
    }
