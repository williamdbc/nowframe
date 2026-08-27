import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { PlaybackErrorMessage } from './playback-error-message'

describe('PlaybackErrorMessage', () => {
  afterEach(() => vi.useRealTimers())

  it('hides the playback error after ten seconds', () => {
    vi.useFakeTimers()
    render(<PlaybackErrorMessage message="Player command failed: restriction violated" />)

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Player command failed: restriction violated'
    )

    act(() => vi.advanceTimersByTime(9_999))
    expect(screen.getByRole('alert')).toBeVisible()

    act(() => vi.advanceTimersByTime(1))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
