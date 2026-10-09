import { usePlaybackPosition } from '@/features/playback/hooks/usePlaybackPosition'
import { playbackClock } from '@/features/playback/utils/playback-clock'

const lyricsCadenceMs = 50

export function useLyricsPlaybackPosition(positionMs: number, isPlaying: boolean): number {
  const livePositionMs = usePlaybackPosition(lyricsCadenceMs)

  if (!playbackClock.hasAnchor()) return positionMs

  return isPlaying ? livePositionMs : positionMs
}
