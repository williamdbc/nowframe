import { usePlaybackPosition } from '@/features/playback/hooks/usePlaybackPosition'
import { playbackClock } from '@/features/playback/utils/playback-clock'

/**
 * Cadência de re-render da letra. Mais fino que os 100 ms anteriores, e agora vem do relógio
 * compartilhado: antes havia um segundo `setInterval` empilhado sobre um tick de 250 ms, e
 * como `positionMs` estava nas dependências do efeito, o intervalo era destruído e recriado
 * quatro vezes por segundo.
 */
const lyricsCadenceMs = 50

export function useLyricsPlaybackPosition(positionMs: number, isPlaying: boolean): number {
  const livePositionMs = usePlaybackPosition(lyricsCadenceMs)

  // Sem âncora no relógio (render isolado, ou antes da primeira resposta do Spotify), a
  // posição reconciliada que veio por prop é a melhor informação disponível.
  if (!playbackClock.hasAnchor()) return positionMs

  return isPlaying ? livePositionMs : positionMs
}
