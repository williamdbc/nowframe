import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { TracklistCarousel } from './tracklist-carousel'

const tracks = [
  {
    creatorNames: ['M83'],
    discNumber: 1,
    durationMs: 244_000,
    id: 'track-1',
    imageUrl: 'https://i.scdn.co/image/track-1',
    isPlayable: true,
    position: 0,
    title: 'Intro',
    trackNumber: 1,
    uri: 'spotify:track:track-1'
  },
  {
    creatorNames: ['M83'],
    discNumber: 1,
    durationMs: 244_000,
    id: 'track-2',
    imageUrl: 'https://i.scdn.co/image/track-2',
    isPlayable: true,
    position: 1,
    title: 'Midnight City',
    trackNumber: 2,
    uri: 'spotify:track:track-2'
  }
]

describe('TracklistCarousel', () => {
  it('centers the current track and lets the user play another context track', async () => {
    const user = userEvent.setup()
    const onPlayTrack = vi.fn()

    render(
      <TracklistCarousel
        contextName="Hurry Up, We’re Dreaming"
        currentTrackId="track-2"
        fallbackImageUrl="https://i.scdn.co/image/album-cover"
        isPending={false}
        isPlayPending={false}
        onPlayTrack={onPlayTrack}
        tracks={tracks}
      />
    )

    expect(screen.getByRole('button', { name: 'Tocando agora: Midnight City' })).toHaveAttribute(
      'aria-current',
      'true'
    )
    expect(screen.getByRole('img', { name: 'Capa de Midnight City' })).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Reproduzir Intro' }))
    expect(onPlayTrack).toHaveBeenCalledWith(tracks[0])
  })
})
