import { useEffect, useState } from 'react'

import type { PlaybackState } from '../types/playback-state'
import { calculatePlaybackProgress } from '../utils/calculate-playback-progress'

const progressUpdateIntervalMs = 250

export function useLivePlaybackState(playback: PlaybackState | null): PlaybackState | null {
  const [now, setNow] = useState(0)

  useEffect(() => {
    if (!playback?.isPlaying || !playback.item) return undefined

    const interval = window.setInterval(() => setNow(Date.now()), progressUpdateIntervalMs)
    return () => window.clearInterval(interval)
  }, [playback?.isPlaying, playback?.item])

  if (!playback) return null

  return {
    ...playback,
    progressMs: calculatePlaybackProgress(playback, now)
  }
}
