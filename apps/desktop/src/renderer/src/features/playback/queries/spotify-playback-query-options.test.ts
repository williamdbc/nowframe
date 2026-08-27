import { describe, expect, it } from 'vitest'

import type { PlaybackState } from '../types/playback-state'
import {
  activePlaybackRefetchIntervalMs,
  failedPlaybackRefetchIntervalMs,
  getSpotifyPlaybackRefetchInterval,
  idlePlaybackRefetchIntervalMs
} from './spotify-playback-query-options'

const playback: PlaybackState = {
  capabilities: {
    canPause: true,
    canResume: true,
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

describe('getSpotifyPlaybackRefetchInterval', () => {
  it('uses adaptive intervals for active, idle and failed synchronization', () => {
    expect(getSpotifyPlaybackRefetchInterval(playback, false)).toBe(activePlaybackRefetchIntervalMs)
    expect(getSpotifyPlaybackRefetchInterval({ ...playback, isPlaying: false }, false)).toBe(
      idlePlaybackRefetchIntervalMs
    )
    expect(getSpotifyPlaybackRefetchInterval(null, false)).toBe(idlePlaybackRefetchIntervalMs)
    expect(getSpotifyPlaybackRefetchInterval(undefined, false)).toBe(idlePlaybackRefetchIntervalMs)
    expect(getSpotifyPlaybackRefetchInterval(playback, true)).toBe(failedPlaybackRefetchIntervalMs)
  })
})
