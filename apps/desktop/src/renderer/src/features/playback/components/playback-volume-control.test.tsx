import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { PlaybackVolumeControl } from './playback-volume-control'

describe('PlaybackVolumeControl', () => {
  it('commits a selected volume and exposes mute as a separate action', async () => {
    const user = userEvent.setup()
    const onSetVolume = vi.fn()
    const onToggleMute = vi.fn()
    render(
      <PlaybackVolumeControl
        canSetVolume
        isPending={false}
        onSetVolume={onSetVolume}
        onToggleMute={onToggleMute}
        volumePercent={64}
      />
    )
    const slider = screen.getByRole('slider', { name: 'Volume' })

    fireEvent.change(slider, { target: { value: '42' } })
    expect(onSetVolume).not.toHaveBeenCalled()
    expect(screen.getByText('42%')).toBeInTheDocument()

    fireEvent.pointerUp(slider, { target: { value: '42' } })
    await user.click(screen.getByRole('button', { name: 'Silenciar' }))

    expect(onSetVolume).toHaveBeenCalledWith(42)
    expect(onToggleMute).toHaveBeenCalledOnce()
  })

  it('offers volume restoration when muted', () => {
    render(
      <PlaybackVolumeControl
        canSetVolume
        isPending={false}
        onSetVolume={vi.fn()}
        onToggleMute={vi.fn()}
        volumePercent={0}
      />
    )

    expect(screen.getByRole('button', { name: 'Restaurar volume' })).toBeEnabled()
  })
})
