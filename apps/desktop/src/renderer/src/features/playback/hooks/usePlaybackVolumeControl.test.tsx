import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SpotifyPlaybackService } from '@/features/playback/services/spotify-playback-service'
import type { PlaybackState } from '@/features/playback/types/playback-state'

import { usePlaybackVolumeControl } from './usePlaybackVolumeControl'

const playback: PlaybackState = {
  capabilities: {
    canPause: true,
    canResume: true,
    canSeek: true,
    canSetVolume: true,
    canSkipNext: true,
    canSkipPrevious: true
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
  synchronizedAt: 1_000
}

function createWrapper(): React.ComponentType<PropsWithChildren> {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return function TestQueryClientProvider({ children }: PropsWithChildren): React.JSX.Element {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

afterEach(() => {
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
})
