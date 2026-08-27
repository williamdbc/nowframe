import { describe, expect, it } from 'vitest'

import type { PlaybackState } from '../types/playback-state'
import { calculatePlaybackProgress } from './calculate-playback-progress'

const playback: PlaybackState = {
  device: {
    id: 'device-id',
    isRestricted: false,
    name: 'MacBook Pro',
    supportsVolume: true,
    type: 'Computer',
    volumePercent: 64
  },
  isPlaying: true,
  item: {
    collectionName: 'Album',
    creatorNames: ['Artist'],
    durationMs: 120_000,
    id: 'track-id',
    imageUrl: null,
    title: 'Track',
    type: 'track'
  },
  progressMs: 30_000,
  synchronizedAt: 1_000
}

describe('calculatePlaybackProgress', () => {
  it('advances locally from the last Spotify synchronization', () => {
    expect(calculatePlaybackProgress(playback, 3_500)).toBe(32_500)
  })

  it('does not advance while paused or past the item duration', () => {
    expect(calculatePlaybackProgress({ ...playback, isPlaying: false }, 3_500)).toBe(30_000)
    expect(calculatePlaybackProgress(playback, 200_000)).toBe(120_000)
  })
})
