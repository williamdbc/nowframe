import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { playbackClock } from '../utils/playback-clock'
import { PlaybackProgressControl } from './playback-progress-control'

afterEach(() => {
  playbackClock.setAnchor(null)
})

describe('PlaybackProgressControl', () => {
  it('paints the position from the shared clock instead of the prop', () => {
    playbackClock.setAnchor({
      durationMs: 120_000,
      isPlaying: true,
      itemKey: 'track:a',
      progressMs: 45_000,
      synchronizedAt: Date.now()
    })

    render(
      <PlaybackProgressControl
        canSeek
        durationMs={120_000}
        isPending={false}
        onSeek={vi.fn()}
        positionMs={0}
      />
    )
    const slider = screen.getByRole('slider', { name: 'Posição da reprodução' })

    expect(Number((slider as HTMLInputElement).value)).toBeGreaterThanOrEqual(45_000)
    expect(slider.style.getPropertyValue('--playback-progress')).not.toBe('')
    expect(screen.getByText('0:45')).toBeInTheDocument()
  })

  it('leaves the drag alone while previewing', () => {
    playbackClock.setAnchor({
      durationMs: 120_000,
      isPlaying: true,
      itemKey: 'track:a',
      progressMs: 45_000,
      synchronizedAt: Date.now()
    })

    render(
      <PlaybackProgressControl
        canSeek
        durationMs={120_000}
        isPending={false}
        onSeek={vi.fn()}
        positionMs={45_000}
      />
    )
    const slider = screen.getByRole('slider', { name: 'Posição da reprodução' })

    fireEvent.change(slider, { target: { value: '90000' } })
    playbackClock.setAnchor({
      durationMs: 120_000,
      isPlaying: true,
      itemKey: 'track:a',
      progressMs: 46_000,
      synchronizedAt: Date.now()
    })

    expect(Number((slider as HTMLInputElement).value)).toBe(90_000)
    expect(screen.getByText('1:30')).toBeInTheDocument()
  })

  it('seeks in useful increments from the keyboard', () => {
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

    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    fireEvent.keyUp(slider, { key: 'ArrowRight' })

    expect(onSeek).toHaveBeenCalledWith(35_000)
  })

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
