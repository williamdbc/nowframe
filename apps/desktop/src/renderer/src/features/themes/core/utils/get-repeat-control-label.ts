import type { SpotifyRepeatMode } from '../../../../../../contracts/music-display-api'

export function getRepeatControlLabel(repeatMode: SpotifyRepeatMode): string {
  switch (repeatMode) {
    case 'off':
      return 'Ativar repetição'
    case 'context':
      return 'Repetir somente esta faixa'
    case 'track':
      return 'Desativar repetição'
  }
}
