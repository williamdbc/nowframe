import { useEffect, useRef, useState } from 'react'

import { playbackClock } from '../utils/playback-clock'

/**
 * Posição viva para quem precisa do número em JS e portanto re-renderiza.
 *
 * O relógio notifica a cada frame; `cadenceMs` limita quantas dessas notificações viram
 * render. Quem só precisa desenhar deve assinar `playbackClock` direto e escrever no DOM,
 * sem passar pelo React.
 */
export function usePlaybackPosition(cadenceMs: number): number {
  const [positionMs, setPositionMs] = useState(() => playbackClock.getPositionMs())
  const lastRenderedAt = useRef(Number.NEGATIVE_INFINITY)

  useEffect(() => {
    const emit = (): void => {
      lastRenderedAt.current = performance.now()
      setPositionMs(playbackClock.getPositionMs())
    }

    const unsubscribe = playbackClock.subscribe(() => {
      if (performance.now() - lastRenderedAt.current < cadenceMs) return
      emit()
    })

    emit()

    return unsubscribe
  }, [cadenceMs])

  return positionMs
}
