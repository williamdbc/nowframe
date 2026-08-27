import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { PlaybackState } from '@/features/playback/types/playback-state'

import { availableThemes } from './theme-registry'
import type { PlaybackControls, PlayerThemeChrome } from './types/player-theme'

const playback: PlaybackState = {
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
}

const chrome: PlayerThemeChrome = {
  accountMenu: <span>Conta</span>,
  connectionStatus: <span>Conectado</span>,
  fullscreenControl: <span>Tela cheia</span>,
  themeSelector: <span>Temas</span>
}

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
    onCommitVolume: vi.fn().mockResolvedValue(undefined),
    onSetVolume: vi.fn(),
    onToggleMute: vi.fn()
  }
}

describe.each(availableThemes)('$name player theme contract', ({ component: Theme }) => {
  it('renders the required playback content and chrome slots', () => {
    render(
      <Theme
        chrome={chrome}
        controls={createControls()}
        playback={playback}
        playbackStatus="ready"
      />
    )

    expect(screen.getByRole('img', { name: 'Capa de Hurry Up, We’re Dreaming' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Midnight City' })).toBeVisible()
    expect(screen.getByText('M83')).toBeVisible()
    expect(screen.getByText('Hurry Up, We’re Dreaming')).toBeVisible()
    expect(screen.getByText('MacBook Pro')).toBeVisible()
    expect(screen.getByRole('slider', { name: 'Posição da reprodução' })).toBeEnabled()
    expect(screen.getByRole('slider', { name: 'Volume' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Faixa anterior' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Pausar' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Próxima faixa' })).toBeEnabled()
    expect(screen.getByText('Conta')).toBeInTheDocument()
    expect(screen.getByText('Conectado')).toBeInTheDocument()
    expect(screen.getByText('Tela cheia')).toBeInTheDocument()
    expect(screen.getByText('Temas')).toBeInTheDocument()
  })

  it('dispatches the required transport controls', async () => {
    const user = userEvent.setup()
    const controls = createControls()
    render(<Theme chrome={chrome} controls={controls} playback={playback} playbackStatus="ready" />)

    await user.click(screen.getByRole('button', { name: 'Faixa anterior' }))
    await user.click(screen.getByRole('button', { name: 'Pausar' }))
    await user.click(screen.getByRole('button', { name: 'Próxima faixa' }))

    expect(controls.onPrevious).toHaveBeenCalledOnce()
    expect(controls.onPauseOrResume).toHaveBeenCalledOnce()
    expect(controls.onNext).toHaveBeenCalledOnce()
  })

  it('renders a genuine empty state with disabled transport controls', () => {
    render(
      <Theme chrome={chrome} controls={createControls()} playback={null} playbackStatus="ready" />
    )

    expect(screen.getByRole('heading', { name: 'Nada tocando agora' })).toBeVisible()
    expect(screen.getByText('Dê o play no Spotify para ver a música aqui.')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Reproduzir' })).toBeDisabled()
  })
})
