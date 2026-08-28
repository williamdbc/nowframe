import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { spotifyPlaybackQueryKeys } from '../queries/spotify-playback-query-keys'
import type { PlaybackState } from '../types/playback-state'
import { calculatePlaybackProgress } from '../utils/calculate-playback-progress'

export const playbackEndRefreshGraceMs = 150
const minimumPlaybackEndRefreshDelayMs = 250

export function getPlaybackEndRefreshDelay(
  playback: PlaybackState | null | undefined,
  now: number
): number | null {
  if (!playback?.isPlaying || !playback.item) return null

  const progressMs = calculatePlaybackProgress(playback, now)
  const remainingMs = playback.item.durationMs - progressMs

  return Math.max(minimumPlaybackEndRefreshDelayMs, remainingMs + playbackEndRefreshGraceMs)
}

export function useRefreshSpotifyPlaybackNearTrackEnd(
  playback: PlaybackState | null | undefined
): void {
  const queryClient = useQueryClient()

  useEffect(() => {
    const refreshDelayMs = getPlaybackEndRefreshDelay(playback, Date.now())
    if (refreshDelayMs === null) return undefined

    const timeout = window.setTimeout(() => {
      void queryClient.refetchQueries({
        queryKey: spotifyPlaybackQueryKeys.current(),
        type: 'active'
      })
    }, refreshDelayMs)

    return () => window.clearTimeout(timeout)
  }, [playback, queryClient])
}
