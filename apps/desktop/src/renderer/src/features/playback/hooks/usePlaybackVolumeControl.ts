import { useCallback, useEffect, useRef } from 'react'

import { useSetSpotifyPlaybackVolumeMutation } from '@/features/playback/hooks/useSetSpotifyPlaybackVolumeMutation'
import type { PlaybackState } from '@/features/playback/types/playback-state'

const defaultRestoredVolumePercent = 50
export const volumeUpdateIntervalMs = 200

interface PlaybackVolumeControl {
  commitVolume: (volumePercent: number) => Promise<void>
  error: Error | null
  isPending: boolean
  setVolume: (volumePercent: number) => void
  toggleMute: () => void
}

export function usePlaybackVolumeControl(playback: PlaybackState | null): PlaybackVolumeControl {
  const volumeMutation = useSetSpotifyPlaybackVolumeMutation()
  const lastAudibleVolumePercent = useRef(defaultRestoredVolumePercent)
  const lastSentAt = useRef<number | null>(null)
  const queuedVolumePercent = useRef<number | null>(null)
  const queuedCommitResolvers = useRef<Array<() => void>>([])
  const shouldFlushImmediately = useRef(false)
  const isSending = useRef(false)
  const isDisposed = useRef(false)
  const flushTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const processQueueRef = useRef<() => void>(() => undefined)
  const volumePercent = playback?.device.volumePercent ?? null

  useEffect(() => {
    if (volumePercent !== null && volumePercent > 0) {
      lastAudibleVolumePercent.current = volumePercent
    }
  }, [volumePercent])

  const clearFlushTimeout = useCallback((): void => {
    if (flushTimeout.current === null) return

    clearTimeout(flushTimeout.current)
    flushTimeout.current = null
  }, [])

  const scheduleQueueProcessing = useCallback(
    (delayMs: number): void => {
      clearFlushTimeout()
      flushTimeout.current = setTimeout(() => {
        flushTimeout.current = null
        processQueueRef.current()
      }, delayMs)
    },
    [clearFlushTimeout]
  )

  const processQueue = useCallback((): void => {
    if (isDisposed.current || isSending.current || queuedVolumePercent.current === null) return

    const elapsedSinceLastSend =
      lastSentAt.current === null ? volumeUpdateIntervalMs : Date.now() - lastSentAt.current
    const remainingDelay = volumeUpdateIntervalMs - elapsedSinceLastSend

    if (!shouldFlushImmediately.current && remainingDelay > 0) {
      scheduleQueueProcessing(remainingDelay)
      return
    }

    const nextVolumePercent = queuedVolumePercent.current
    const commitResolvers = queuedCommitResolvers.current
    queuedVolumePercent.current = null
    queuedCommitResolvers.current = []
    shouldFlushImmediately.current = false
    isSending.current = true
    lastSentAt.current = Date.now()
    clearFlushTimeout()

    void volumeMutation
      .mutateAsync(nextVolumePercent)
      .catch(() => undefined)
      .finally(() => {
        commitResolvers.forEach((resolve) => resolve())
        isSending.current = false
        processQueueRef.current()
      })
  }, [clearFlushTimeout, scheduleQueueProcessing, volumeMutation])

  useEffect(() => {
    processQueueRef.current = processQueue
  }, [processQueue])

  useEffect(() => {
    isDisposed.current = false

    return () => {
      isDisposed.current = true
      clearFlushTimeout()
      queuedCommitResolvers.current.splice(0).forEach((resolve) => resolve())
    }
  }, [clearFlushTimeout])

  const queueVolume = (nextVolumePercent: number, flushImmediately: boolean): void => {
    queuedVolumePercent.current = Math.min(100, Math.max(0, Math.round(nextVolumePercent)))
    shouldFlushImmediately.current ||= flushImmediately
    processQueueRef.current()
  }

  const setVolume = (nextVolumePercent: number): void => {
    queueVolume(nextVolumePercent, false)
  }

  const commitVolume = (nextVolumePercent: number): Promise<void> => {
    return new Promise((resolve) => {
      queuedCommitResolvers.current.push(resolve)
      queueVolume(nextVolumePercent, true)
    })
  }

  const toggleMute = (): void => {
    if (volumePercent === null) return

    if (volumePercent > 0) {
      lastAudibleVolumePercent.current = volumePercent
      queueVolume(0, true)
      return
    }

    queueVolume(lastAudibleVolumePercent.current, true)
  }

  return {
    commitVolume,
    error: volumeMutation.error,
    isPending: volumeMutation.isPending,
    setVolume,
    toggleMute
  }
}
