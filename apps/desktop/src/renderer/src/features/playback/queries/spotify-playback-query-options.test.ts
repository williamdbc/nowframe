import { describe, expect, it } from 'vitest'

import type { PlaybackState } from '../types/playback-state'
import {
  activePlaybackRefetchIntervalMs,
  boundaryPlaybackRefetchIntervalMs,
  failedPlaybackRefetchIntervalsMs,
  getSpotifyPlaybackRefetchInterval,
  idlePlaybackRefetchIntervalMs,
  playbackWindowFocusFreshnessMs,
  shouldRefetchPlaybackOnWindowFocus
} from './spotify-playback-query-options'

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
  context: null,
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

const withTrack = (progressMs: number, durationMs: number): PlaybackState => ({
  ...playback,
  item: {
    album: { id: 'album-id', uri: 'spotify:album:album-id' },
    collectionName: 'Album',
    creatorNames: ['Artist'],
    durationMs,
    id: 'track-id',
    imageUrl: null,
    title: 'Track',
    type: 'track',
    uri: 'spotify:track:trackid'
  },
  progressMs,
  synchronizedAt: 1_000
})

describe('getSpotifyPlaybackRefetchInterval', () => {
  it('uses adaptive intervals for active and idle synchronization', () => {
    expect(activePlaybackRefetchIntervalMs).toBe(1_500)
    expect(idlePlaybackRefetchIntervalMs).toBe(2_500)
    expect(getSpotifyPlaybackRefetchInterval(playback, 0, 1_000)).toBe(
      activePlaybackRefetchIntervalMs
    )
    expect(getSpotifyPlaybackRefetchInterval({ ...playback, isPlaying: false }, 0, 1_000)).toBe(
      idlePlaybackRefetchIntervalMs
    )
    expect(getSpotifyPlaybackRefetchInterval(null, 0, 1_000)).toBe(idlePlaybackRefetchIntervalMs)
    expect(getSpotifyPlaybackRefetchInterval(undefined, 0, 1_000)).toBe(
      idlePlaybackRefetchIntervalMs
    )
  })

  it('densifies polling inside the track boundary window', () => {
    expect(getSpotifyPlaybackRefetchInterval(withTrack(100_000, 120_000), 0, 1_000)).toBe(
      activePlaybackRefetchIntervalMs
    )
    expect(getSpotifyPlaybackRefetchInterval(withTrack(118_000, 120_000), 0, 1_000)).toBe(
      boundaryPlaybackRefetchIntervalMs
    )
  })

  it('counts the time elapsed since synchronization when predicting the boundary', () => {
    // 110 s de 120 s na âncora: fora da janela. Passados 8 s, está dentro.
    expect(getSpotifyPlaybackRefetchInterval(withTrack(110_000, 120_000), 0, 1_000)).toBe(
      activePlaybackRefetchIntervalMs
    )
    expect(getSpotifyPlaybackRefetchInterval(withTrack(110_000, 120_000), 0, 9_000)).toBe(
      boundaryPlaybackRefetchIntervalMs
    )
  })

  it('backs off progressively on failures instead of plateauing at thirty seconds', () => {
    expect(getSpotifyPlaybackRefetchInterval(playback, 1, 1_000)).toBe(
      failedPlaybackRefetchIntervalsMs[0]
    )
    expect(getSpotifyPlaybackRefetchInterval(playback, 2, 1_000)).toBe(
      failedPlaybackRefetchIntervalsMs[1]
    )
    expect(getSpotifyPlaybackRefetchInterval(playback, 99, 1_000)).toBe(
      failedPlaybackRefetchIntervalsMs[failedPlaybackRefetchIntervalsMs.length - 1]
    )
  })
})

describe('shouldRefetchPlaybackOnWindowFocus', () => {
  it('skips a duplicate request while the cached playback is still fresh', () => {
    expect(shouldRefetchPlaybackOnWindowFocus(10_000, 11_999)).toBe(false)
    expect(
      shouldRefetchPlaybackOnWindowFocus(10_000, 10_000 + playbackWindowFocusFreshnessMs)
    ).toBe(true)
  })
})
