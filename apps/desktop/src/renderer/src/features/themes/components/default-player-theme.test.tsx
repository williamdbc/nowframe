import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import type { PlaybackControls } from '../types/player-theme'
import { DefaultPlayerTheme } from './default-player-theme'

function createControls(): PlaybackControls {
  return {
    errorMessage: null,
    isCommandPending: false,
    isSeekPending: false,
    isVolumePending: false,
    onNext: vi.fn(),
    onPauseOrResume: vi.fn(),
    onPrevious: vi.fn(),
    onSeek: vi.fn(),
    onSetVolume: vi.fn(),
    onToggleMute: vi.fn()
  }
}

describe('DefaultPlayerTheme', () => {
  it('renders the real empty playback state', () => {
    render(
      <DefaultPlayerTheme controls={createControls()} playback={null} playbackStatus="ready" />
    )

    expect(screen.getByRole('heading', { name: 'Nada tocando agora' })).toBeInTheDocument()
    expect(screen.getByText('Dê o play no Spotify para ver a música aqui.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reproduzir' })).toBeDisabled()
  })

  it('distinguishes initial synchronization and errors from an empty player', () => {
    const controls = createControls()
    const { rerender } = render(
      <DefaultPlayerTheme controls={controls} playback={null} playbackStatus="loading" />
    )

    expect(screen.getByRole('heading', { name: 'Sincronizando com Spotify' })).toBeInTheDocument()

    rerender(<DefaultPlayerTheme controls={controls} playback={null} playbackStatus="error" />)

    expect(screen.getByRole('heading', { name: 'Não foi possível atualizar' })).toBeInTheDocument()
  })

  it('renders metadata and sends available playback controls', async () => {
    const user = userEvent.setup()
    const controls = createControls()

    render(
      <DefaultPlayerTheme
        controls={controls}
        playbackStatus="ready"
        playback={{
          capabilities: {
            canPause: true,
            canResume: true,
            canSeek: true,
            canSetVolume: true,
            canSkipNext: true,
            canSkipPrevious: true
          },
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
    await user.click(screen.getByRole('button', { name: 'Faixa anterior' }))
    await user.click(screen.getByRole('button', { name: 'Pausar' }))
    await user.click(screen.getByRole('button', { name: 'Próxima faixa' }))
    expect(controls.onPrevious).toHaveBeenCalledOnce()
    expect(controls.onPauseOrResume).toHaveBeenCalledOnce()
    expect(controls.onNext).toHaveBeenCalledOnce()
  })
})
