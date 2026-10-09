import type { PlaybackState } from '../types/playback-state'

const expectationTimeToLiveMs = 2_500

interface PlaybackExpectation {
  expiresAt: number
  isSatisfiedBy: (playback: PlaybackState) => boolean
}

let expectation: PlaybackExpectation | null = null

export function expectPlayback(
  isSatisfiedBy: (playback: PlaybackState) => boolean,
  now: number = Date.now()
): void {
  expectation = { expiresAt: now + expectationTimeToLiveMs, isSatisfiedBy }
}

export function clearPlaybackExpectation(): void {
  expectation = null
}

export function shouldDiscardPlayback(
  playback: PlaybackState | null,
  now: number = Date.now()
): boolean {
  if (!expectation) return false

  if (now >= expectation.expiresAt) {
    expectation = null
    return false
  }

  if (!playback) return false

  if (expectation.isSatisfiedBy(playback)) {
    expectation = null
    return false
  }

  return true
}
