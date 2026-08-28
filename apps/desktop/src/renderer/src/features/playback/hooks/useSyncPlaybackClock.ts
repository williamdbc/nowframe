import { useEffect } from 'react'

import type { PlaybackState } from '../types/playback-state'
import { getPlaybackContentKey } from '../utils/get-playback-content-key'
import { playbackClock } from '../utils/playback-clock'

/**
 * Empurra a verdade do servidor para o relógio compartilhado. Deve receber os dados crus da
 * query — não uma versão já interpolada — porque é a âncora, não a leitura.
 */
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
