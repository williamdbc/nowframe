import type { PlaybackState } from '../types/playback-state'

export function calculatePlaybackProgress(playback: PlaybackState, now: number): number {
  if (!playback.isPlaying || !playback.item) return playback.progressMs

  const elapsedSinceSynchronization = Math.max(0, now - playback.synchronizedAt)
  return Math.min(playback.item.durationMs, playback.progressMs + elapsedSinceSynchronization)
}
