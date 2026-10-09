import { afterEach, describe, expect, it } from 'vitest'

import type { PlaybackState } from '../types/playback-state'
import {
  clearPlaybackExpectation,
  expectPlayback,
  shouldDiscardPlayback
} from './playback-expectation'

const playback = {
  repeatMode: 'off',
  shuffleEnabled: false
} as PlaybackState

afterEach(() => {
  clearPlaybackExpectation()
})

describe('shouldDiscardPlayback', () => {
  it('keeps every response when nothing is expected', () => {
    expect(shouldDiscardPlayback(playback, 1_000)).toBe(false)
  })

  it('discards a response that contradicts the expectation', () => {
    expectPlayback((state) => state.shuffleEnabled, 1_000)

    expect(shouldDiscardPlayback(playback, 1_100)).toBe(true)
  })

  it('accepts a response that satisfies the expectation', () => {
    expectPlayback((state) => state.shuffleEnabled, 1_000)

    expect(shouldDiscardPlayback({ ...playback, shuffleEnabled: true }, 1_100)).toBe(false)
  })

  it('stops guarding once the expectation is satisfied', () => {
    expectPlayback((state) => state.shuffleEnabled, 1_000)
    shouldDiscardPlayback({ ...playback, shuffleEnabled: true }, 1_100)

    expect(shouldDiscardPlayback(playback, 1_200)).toBe(false)
  })

  it('gives up after the expectation expires', () => {
    expectPlayback((state) => state.shuffleEnabled, 1_000)

    expect(shouldDiscardPlayback(playback, 1_100)).toBe(true)
    expect(shouldDiscardPlayback(playback, 1_000 + 2_500)).toBe(false)
  })

  it('never discards an absent playback, so an idle device still clears the screen', () => {
    expectPlayback((state) => state.shuffleEnabled, 1_000)

    expect(shouldDiscardPlayback(null, 1_100)).toBe(false)
  })

  it('drops the expectation when a command fails', () => {
    expectPlayback((state) => state.shuffleEnabled, 1_000)
    clearPlaybackExpectation()

    expect(shouldDiscardPlayback(playback, 1_100)).toBe(false)
  })
})
