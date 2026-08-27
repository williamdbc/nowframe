import { useEffect, useRef } from 'react'

import { useSetSpotifyPlaybackVolumeMutation } from '@/features/playback/hooks/useSetSpotifyPlaybackVolumeMutation'
import type { PlaybackState } from '@/features/playback/types/playback-state'

const defaultRestoredVolumePercent = 50

interface PlaybackVolumeControl {
  error: Error | null
  isPending: boolean
  setVolume: (volumePercent: number) => void
  toggleMute: () => void
}

export function usePlaybackVolumeControl(playback: PlaybackState | null): PlaybackVolumeControl {
  const volumeMutation = useSetSpotifyPlaybackVolumeMutation()
  const lastAudibleVolumePercent = useRef(defaultRestoredVolumePercent)
  const volumePercent = playback?.device.volumePercent ?? null

  useEffect(() => {
    if (volumePercent !== null && volumePercent > 0) {
      lastAudibleVolumePercent.current = volumePercent
    }
  }, [volumePercent])

  const setVolume = (nextVolumePercent: number): void => {
    volumeMutation.mutate(Math.round(nextVolumePercent))
  }

  const toggleMute = (): void => {
    if (volumePercent === null) return

    if (volumePercent > 0) {
      lastAudibleVolumePercent.current = volumePercent
      volumeMutation.mutate(0)
      return
    }

    volumeMutation.mutate(lastAudibleVolumePercent.current)
  }

  return {
    error: volumeMutation.error,
    isPending: volumeMutation.isPending,
    setVolume,
    toggleMute
  }
}
