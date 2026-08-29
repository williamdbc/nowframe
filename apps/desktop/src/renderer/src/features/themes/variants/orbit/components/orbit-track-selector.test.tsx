import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { SpotifyTracklistTrack } from '../../../../../../../contracts/nowframe-api'

import { OrbitTrackSelector } from './orbit-track-selector'

const tracks: SpotifyTracklistTrack[] = [
  {
    creatorNames: ['Massive Attack'],
    discNumber: 1,
    durationMs: 300_000,
    id: 'track-1',
    imageUrl: null,
    isPlayable: true,
    position: 0,
    title: 'Angel',
    trackNumber: 1,
    uri: 'spotify:track:track-1'
  },
  {
    creatorNames: ['Massive Attack'],
    discNumber: 1,
    durationMs: 360_000,
    id: 'track-2',
    imageUrl: null,
    isPlayable: true,
    position: 1,
    title: 'Teardrop',
    trackNumber: 2,
    uri: 'spotify:track:track-2'
  }
]

describe('OrbitTrackSelector', () => {
  it('plays an available orbit node on click', () => {
    const onPlayTrack = vi.fn()
    render(
      <OrbitTrackSelector
        currentTrackId="track-1"
        isPlayPending={false}
        onPlayTrack={onPlayTrack}
        tracks={tracks}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Reproduzir Teardrop' }))
    expect(onPlayTrack).toHaveBeenCalledWith(tracks[1])
  })

  it('rotates by dragging without selecting the node under the pointer', () => {
    const onPlayTrack = vi.fn()
    render(
      <OrbitTrackSelector
        currentTrackId="track-1"
        isPlayPending={false}
        onPlayTrack={onPlayTrack}
        tracks={tracks}
      />
    )
    const orbit = screen.getByLabelText('Órbita de faixas')
    const node = screen.getByRole('button', { name: 'Reproduzir Teardrop' })

    fireEvent.pointerDown(orbit, { button: 0, clientX: 100, pointerId: 1 })
    fireEvent.pointerMove(orbit, { clientX: 150, pointerId: 1 })
    fireEvent.pointerUp(orbit, { pointerId: 1 })
    fireEvent.click(node)

    expect(orbit).toHaveStyle({ '--orbit-rotation': '16deg' })
    expect(onPlayTrack).not.toHaveBeenCalled()
  })
})
