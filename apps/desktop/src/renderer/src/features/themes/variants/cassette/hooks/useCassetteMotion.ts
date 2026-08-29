import { useEffect } from 'react'
import type { RefObject } from 'react'

import { playbackClock } from '@/features/playback/utils/playback-clock'

const millisecondsPerReelTurn = 6_000
const minimumTapeRadiusPx = 34
const maximumTapeRadiusPx = 58

export function useCassetteMotion(cassetteRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const paint = (): void => {
      const cassette = cassetteRef.current
      if (!cassette) return

      const durationMs = playbackClock.getDurationMs()
      const positionMs = playbackClock.getPositionMs()
      const progress = durationMs > 0 ? Math.min(1, Math.max(0, positionMs / durationMs)) : 0
      const reelTurn = ((positionMs / millisecondsPerReelTurn) % 1) * 360
      const tapeRangePx = maximumTapeRadiusPx - minimumTapeRadiusPx

      cassette.style.setProperty('--cassette-progress', String(progress))
      cassette.style.setProperty('--cassette-reel-turn', `${reelTurn}deg`)
      cassette.style.setProperty(
        '--cassette-left-tape-size',
        `${maximumTapeRadiusPx - tapeRangePx * progress}px`
      )
      cassette.style.setProperty(
        '--cassette-right-tape-size',
        `${minimumTapeRadiusPx + tapeRangePx * progress}px`
      )
    }

    paint()

    return playbackClock.subscribe(paint)
  }, [cassetteRef])
}
