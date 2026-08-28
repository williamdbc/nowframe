import type { SpotifyRepeatMode } from '../../../../../contracts/nowframe-api'

export function getNextRepeatMode(repeatMode: SpotifyRepeatMode): SpotifyRepeatMode {
  switch (repeatMode) {
    case 'off':
      return 'context'
    case 'context':
      return 'track'
    case 'track':
      return 'off'
  }
}
