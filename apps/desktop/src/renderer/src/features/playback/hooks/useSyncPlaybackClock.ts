import { useEffect } from 'react'

import type { PlaybackState } from '../types/playback-state'
import { getPlaybackContentKey } from '../utils/get-playback-content-key'
import { playbackClock } from '../utils/playback-clock'

export function useSyncPlaybackClock(playback: PlaybackState | null): void {
  const itemKey = getPlaybackContentKey(playback)
  const durationMs = playback?.item?.durationMs ?? 0
  const isPlaying = playback?.isPlaying ?? false
  const progressMs = playback?.progressMs ?? 0
  const synchronizedAt = playback?.synchronizedAt ?? 0
  const hasItem = Boolean(playback?.item)

  useEffect(() => {
    if (!hasItem) {
      playbackClock.setAnchor(null)
      return
    }

    playbackClock.setAnchor({ durationMs, isPlaying, itemKey, progressMs, synchronizedAt })
  }, [durationMs, hasItem, isPlaying, itemKey, progressMs, synchronizedAt])
}
