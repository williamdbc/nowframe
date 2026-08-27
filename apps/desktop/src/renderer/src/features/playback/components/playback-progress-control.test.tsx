import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { PlaybackProgressControl } from './playback-progress-control'

describe('PlaybackProgressControl', () => {
  it('previews while dragging and seeks only when the interaction finishes', () => {
    const onSeek = vi.fn()
    render(
      <PlaybackProgressControl
        canSeek
        durationMs={120_000}
        isPending={false}
        onSeek={onSeek}
        positionMs={30_000}
      />
    )
    const slider = screen.getByRole('slider', { name: 'Posição da reprodução' })

    fireEvent.change(slider, { target: { value: '75000' } })

    expect(onSeek).not.toHaveBeenCalled()
    expect(screen.getByText('1:15')).toBeInTheDocument()

    fireEvent.pointerUp(slider, { target: { value: '75000' } })

    expect(onSeek).toHaveBeenCalledWith(75_000)
  })
})
