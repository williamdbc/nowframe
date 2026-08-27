import { render, screen } from '@testing-library/react'

import { DefaultPlayerTheme } from './default-player-theme'

describe('DefaultPlayerTheme', () => {
  it('renders the real empty playback state', () => {
    render(<DefaultPlayerTheme playback={null} playbackStatus="ready" />)

    expect(screen.getByRole('heading', { name: 'Nada tocando agora' })).toBeInTheDocument()
    expect(screen.getByText('Dê o play no Spotify para ver a música aqui.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reproduzir' })).toBeDisabled()
  })

  it('distinguishes initial synchronization and errors from an empty player', () => {
    const { rerender } = render(<DefaultPlayerTheme playback={null} playbackStatus="loading" />)

    expect(screen.getByRole('heading', { name: 'Sincronizando com Spotify' })).toBeInTheDocument()

    rerender(<DefaultPlayerTheme playback={null} playbackStatus="error" />)

    expect(screen.getByRole('heading', { name: 'Não foi possível atualizar' })).toBeInTheDocument()
  })

  it('renders synchronized playback metadata and device information', () => {
    render(
      <DefaultPlayerTheme
        playbackStatus="ready"
        playback={{
          device: {
            id: 'device-id',
            isRestricted: false,
            name: 'MacBook Pro',
            supportsVolume: true,
            type: 'Computer',
            volumePercent: 64
          },
          isPlaying: true,
          item: {
            collectionName: 'Hurry Up, We’re Dreaming',
            creatorNames: ['M83'],
            durationMs: 244_000,
            id: 'track-id',
            imageUrl: 'https://i.scdn.co/image/album-cover',
            title: 'Midnight City',
            type: 'track'
          },
          progressMs: 42_000,
          synchronizedAt: 1_000
        }}
      />
    )

    expect(screen.getByRole('heading', { name: 'Midnight City' })).toBeInTheDocument()
    expect(screen.getByText('M83')).toBeInTheDocument()
    expect(screen.getByText('Hurry Up, We’re Dreaming')).toBeInTheDocument()
    expect(screen.getByText('MacBook Pro')).toBeInTheDocument()
    expect(screen.getByText('64%')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pausar' })).toBeDisabled()
  })
})
