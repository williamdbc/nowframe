import { useEffect, useState } from 'react'

const lyricsClockIntervalMs = 100

export function useLyricsPlaybackPosition(positionMs: number, isPlaying: boolean): number {
  const [livePositionMs, setLivePositionMs] = useState(positionMs)

  useEffect(() => {
    if (!isPlaying) return undefined

    const startedAt = Date.now()
    const interval = window.setInterval(() => {
      setLivePositionMs(positionMs + Date.now() - startedAt)
    }, lyricsClockIntervalMs)

    return () => window.clearInterval(interval)
  }, [isPlaying, positionMs])

  return isPlaying ? livePositionMs : positionMs
}
