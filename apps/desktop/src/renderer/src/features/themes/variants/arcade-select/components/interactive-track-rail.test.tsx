import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { SpotifyTracklistTrack } from '../../../../../../../contracts/nowframe-api'

import { InteractiveTrackRail } from './interactive-track-rail'

const tracks: SpotifyTracklistTrack[] = [
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

function renderRail(onPlayTrack = vi.fn()): void {
  render(
    <InteractiveTrackRail
      contextName="Hurry Up, We’re Dreaming"
      currentTrackId="track-2"
      isPending={false}
      isPlayPending={false}
      onPlayTrack={onPlayTrack}
      tracks={tracks}
      renderTrack={(track) => <strong>{track.title}</strong>}
    />
  )
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('InteractiveTrackRail', () => {
  it('centers the current track and plays another track on click', () => {
    const scrollIntoView = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoView
    const onPlayTrack = vi.fn()

    renderRail(onPlayTrack)

    expect(screen.getByRole('button', { name: 'Tocando agora: Midnight City' })).toHaveAttribute(
      'aria-current',
      'true'
    )
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    })

    fireEvent.click(screen.getByRole('button', { name: 'Reproduzir Intro' }))
    expect(onPlayTrack).toHaveBeenCalledWith(tracks[0])
  })

  it('suppresses the click generated after dragging', () => {
    const onPlayTrack = vi.fn()
    renderRail(onPlayTrack)
    const rail = screen.getByLabelText('Faixas de Hurry Up, We’re Dreaming')
    const intro = screen.getByRole('button', { name: 'Reproduzir Intro' })
    rail.scrollLeft = 100

    fireEvent.pointerDown(rail, {
      button: 0,
      clientX: 200,
      pointerId: 1,
      pointerType: 'mouse'
    })
    fireEvent.pointerMove(rail, {
      clientX: 150,
      pointerId: 1,
      pointerType: 'mouse'
    })
    fireEvent.pointerUp(rail, { pointerId: 1, pointerType: 'mouse' })
    fireEvent.click(intro)

    expect(rail).not.toHaveClass('concept-track-rail--dragging')
    expect(rail.scrollLeft).toBe(150)
    expect(onPlayTrack).not.toHaveBeenCalled()
  })

  it('continues moving with inertia after a quick drag', () => {
    let now = 0
    const animationFrames: FrameRequestCallback[] = []
    vi.spyOn(performance, 'now').mockImplementation(() => now)
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      animationFrames.push(callback)
      return animationFrames.length
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined)

    renderRail()
    const rail = screen.getByLabelText('Faixas de Hurry Up, We’re Dreaming')
    rail.scrollLeft = 100

    fireEvent.pointerDown(rail, {
      button: 0,
      clientX: 200,
      pointerId: 1,
      pointerType: 'mouse'
    })
    now = 16
    fireEvent.pointerMove(rail, {
      clientX: 180,
      pointerId: 1,
      pointerType: 'mouse'
    })
    now = 20
    fireEvent.pointerUp(rail, { pointerId: 1, pointerType: 'mouse' })

    expect(rail.scrollLeft).toBe(120)
    act(() => animationFrames.shift()?.(36))
    expect(rail.scrollLeft).toBeGreaterThan(120)
  })

  it('renders explicit loading and empty states', () => {
    const { rerender } = render(
      <InteractiveTrackRail
        contextName="Playlist"
        currentTrackId={null}
        isPending
        isPlayPending={false}
        onPlayTrack={vi.fn()}
        tracks={[]}
        renderTrack={() => null}
      />
    )

    expect(screen.getByRole('status')).toHaveTextContent('Carregando lista de faixas...')

    rerender(
      <InteractiveTrackRail
        contextName="Playlist"
        currentTrackId={null}
        emptyMessage="Nenhuma estação disponível."
        isPending={false}
        isPlayPending={false}
        onPlayTrack={vi.fn()}
        tracks={[]}
        renderTrack={() => null}
      />
    )
    expect(screen.getByText('Nenhuma estação disponível.')).toBeVisible()
  })
})
