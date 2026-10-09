import { useEffect } from 'react'
import type { RefObject } from 'react'

import { playbackClock } from '@/features/playback/utils/playback-clock'

const secondsPerTurn = 20

export function useVinylRotation(recordRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const paint = (): void => {
      const record = recordRef.current
      if (!record) return

      const turns = playbackClock.getPositionMs() / (secondsPerTurn * 1000)

      record.style.setProperty('--vinyl-rotation', `${(turns % 1) * 360}deg`)
    }

    const synchronize = (): (() => void) | undefined => {
      if (reducedMotion.matches) {
        recordRef.current?.style.setProperty('--vinyl-rotation', '0deg')
        return undefined
      }

      paint()
      return playbackClock.subscribe(paint)
    }

    let unsubscribe = synchronize()

    const handlePreferenceChange = (): void => {
      unsubscribe?.()
      unsubscribe = synchronize()
    }

    reducedMotion.addEventListener('change', handlePreferenceChange)

    return () => {
      unsubscribe?.()
      reducedMotion.removeEventListener('change', handlePreferenceChange)
    }
  }, [recordRef])
}
