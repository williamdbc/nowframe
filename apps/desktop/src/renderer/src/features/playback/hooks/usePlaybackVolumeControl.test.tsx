import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SpotifyPlaybackService } from '@/features/playback/services/spotify-playback-service'
import type { PlaybackState } from '@/features/playback/types/playback-state'

import { usePlaybackVolumeControl, volumeUpdateIntervalMs } from './usePlaybackVolumeControl'

const playback: PlaybackState = {
  capabilities: {
    canPause: true,
    canResume: true,
    canSeek: true,
    canSetVolume: true,
    canSkipNext: true,
    canSkipPrevious: true,
    canToggleRepeat: true,
    canToggleShuffle: true
  },
  device: {
    id: 'device-id',
    isRestricted: false,
    name: 'MacBook Pro',
    supportsVolume: true,
    type: 'Computer',
    volumePercent: 64
  },
  isPlaying: true,
  item: null,
  progressMs: 0,
  repeatMode: 'off',
  shuffleEnabled: false,
  synchronizedAt: 1_000
}

function createWrapper(): React.ComponentType<PropsWithChildren> {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return function TestQueryClientProvider({ children }: PropsWithChildren): React.JSX.Element {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('usePlaybackVolumeControl', () => {
  it('mutes and restores the last audible volume', async () => {
    const setVolumeSpy = vi.spyOn(SpotifyPlaybackService, 'setVolume').mockResolvedValue(undefined)
    const { result, rerender } = renderHook(
      ({ currentPlayback }) => usePlaybackVolumeControl(currentPlayback),
      {
        initialProps: { currentPlayback: playback },
        wrapper: createWrapper()
      }
    )

    act(() => result.current.toggleMute())
    await waitFor(() => expect(setVolumeSpy).toHaveBeenLastCalledWith(0))

    rerender({
      currentPlayback: {
        ...playback,
        device: { ...playback.device, volumePercent: 0 }
      }
    })
    act(() => result.current.toggleMute())
    await waitFor(() => expect(setVolumeSpy).toHaveBeenLastCalledWith(64))
  })

  it('throttles volume updates and sends only the latest queued value', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(1_000)
    const setVolumeSpy = vi.spyOn(SpotifyPlaybackService, 'setVolume').mockResolvedValue(undefined)
    const { result } = renderHook(() => usePlaybackVolumeControl(playback), {
      wrapper: createWrapper()
    })

    await act(async () => {
      result.current.setVolume(40)
      await Promise.resolve()
    })
    expect(setVolumeSpy).toHaveBeenCalledTimes(1)
    expect(setVolumeSpy).toHaveBeenLastCalledWith(40)

    act(() => {
      result.current.setVolume(41)
      result.current.setVolume(42)
    })
    await act(async () => {
      vi.advanceTimersByTime(volumeUpdateIntervalMs - 1)
      await Promise.resolve()
    })
    expect(setVolumeSpy).toHaveBeenCalledTimes(1)

    await act(async () => {
      vi.advanceTimersByTime(1)
      await Promise.resolve()
    })
    expect(setVolumeSpy).toHaveBeenCalledTimes(2)
    expect(setVolumeSpy).toHaveBeenLastCalledWith(42)
  })

  it('serializes requests and prioritizes the final committed volume', async () => {
    let resolveFirstRequest: (() => void) | undefined
    const setVolumeSpy = vi
      .spyOn(SpotifyPlaybackService, 'setVolume')
      .mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            resolveFirstRequest = resolve
          })
      )
      .mockResolvedValue(undefined)
    const { result } = renderHook(() => usePlaybackVolumeControl(playback), {
      wrapper: createWrapper()
    })

    act(() => result.current.setVolume(40))
    await waitFor(() => expect(setVolumeSpy).toHaveBeenCalledWith(40))

    let commitPromise: Promise<void> | undefined
    act(() => {
      result.current.setVolume(41)
      result.current.setVolume(42)
      commitPromise = result.current.commitVolume(43)
    })
    expect(setVolumeSpy).toHaveBeenCalledTimes(1)

    await act(async () => {
      resolveFirstRequest?.()
      await commitPromise
    })
    await waitFor(() => expect(setVolumeSpy).toHaveBeenCalledTimes(2))
    expect(setVolumeSpy).toHaveBeenLastCalledWith(43)
  })
})
