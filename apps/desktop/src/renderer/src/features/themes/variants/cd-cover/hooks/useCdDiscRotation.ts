import { useEffect } from 'react'
import type { RefObject } from 'react'

import { playbackClock } from '@/features/playback/utils/playback-clock'

const secondsPerTurn = 16

export function useCdDiscRotation(discRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const paint = (): void => {
      const disc = discRef.current
      if (!disc) return

      const turns = playbackClock.getPositionMs() / (secondsPerTurn * 1000)

      disc.style.setProperty('--cd-disc-rotation', `${(turns % 1) * 360}deg`)
    }

    paint()

    return playbackClock.subscribe(paint)
  }, [discRef])
}
