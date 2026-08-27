import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { PlaybackVolumeControl } from './playback-volume-control'

describe('PlaybackVolumeControl', () => {
  it('commits a selected volume and exposes mute as a separate action', async () => {
    const user = userEvent.setup()
    const onCommitVolume = vi.fn().mockResolvedValue(undefined)
    const onSetVolume = vi.fn()
    const onToggleMute = vi.fn()
    render(
      <PlaybackVolumeControl
        canSetVolume
        isPending={false}
        onCommitVolume={onCommitVolume}
        onSetVolume={onSetVolume}
        onToggleMute={onToggleMute}
        volumePercent={64}
      />
    )
    const slider = screen.getByRole('slider', { name: 'Volume' })

    fireEvent.change(slider, { target: { value: '42' } })
    expect(onSetVolume).toHaveBeenCalledWith(42)
    expect(onCommitVolume).not.toHaveBeenCalled()
    expect(screen.getByText('42%')).toBeInTheDocument()

    fireEvent.pointerUp(slider, { target: { value: '42' } })
    await user.click(screen.getByRole('button', { name: 'Silenciar' }))

    expect(onCommitVolume).toHaveBeenCalledWith(42)
    expect(onToggleMute).toHaveBeenCalledOnce()
  })

  it('offers volume restoration when muted', () => {
    render(
      <PlaybackVolumeControl
        canSetVolume
        isPending={false}
        onCommitVolume={vi.fn().mockResolvedValue(undefined)}
        onSetVolume={vi.fn()}
        onToggleMute={vi.fn()}
        volumePercent={0}
      />
    )

    expect(screen.getByRole('button', { name: 'Restaurar volume' })).toBeEnabled()
  })

  it('stays interactive while a volume update is pending', () => {
    render(
      <PlaybackVolumeControl
        canSetVolume
        isPending
        onCommitVolume={vi.fn().mockResolvedValue(undefined)}
        onSetVolume={vi.fn()}
        onToggleMute={vi.fn()}
        volumePercent={64}
      />
    )

    expect(screen.getByRole('slider', { name: 'Volume' })).toBeEnabled()
  })

  it('keeps the final preview until the committed volume finishes sending', async () => {
    let resolveCommit: (() => void) | undefined
    const onCommitVolume = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveCommit = resolve
        })
    )
    render(
      <PlaybackVolumeControl
        canSetVolume
        isPending
        onCommitVolume={onCommitVolume}
        onSetVolume={vi.fn()}
        onToggleMute={vi.fn()}
        volumePercent={64}
      />
    )
    const slider = screen.getByRole('slider', { name: 'Volume' })

    fireEvent.change(slider, { target: { value: '42' } })
    fireEvent.pointerUp(slider, { target: { value: '42' } })
    expect(screen.getByText('42%')).toBeInTheDocument()

    resolveCommit?.()
    await waitFor(() => expect(screen.getByText('64%')).toBeInTheDocument())
  })
})
