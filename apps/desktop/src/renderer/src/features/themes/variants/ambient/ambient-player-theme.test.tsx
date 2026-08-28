import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { LyricsDisplayState } from '@/features/lyrics/types/lyrics-display-state'
import type { PlaybackState } from '@/features/playback/types/playback-state'
import type { PlaybackControls, PlayerThemeProps } from '@/features/themes/core/types/player-theme'

import { AmbientPlayerTheme } from './ambient-player-theme'

const playback: PlaybackState = {
  capabilities: {
    canPause: true,
    canResume: true,
    canSeek: true,
    canSetVolume: true,
    canSkipNext: true,
    canSkipPrevious: true,
    canToggleRepeat: true,
    canToggleShuffle: true
  },
  context: { id: 'album-id', type: 'album', uri: 'spotify:album:album-id' },
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
    album: { id: 'album-id', uri: 'spotify:album:album-id' },
    collectionName: 'Koi No Yokan',
    creatorNames: ['Deftones'],
    durationMs: 194_000,
    id: 'track-id',
    imageUrl: 'https://i.scdn.co/image/album-cover',
    title: 'Entombed',
    type: 'track',
    uri: 'spotify:track:trackid'
  },
  progressMs: 12_000,
  repeatMode: 'off',
  shuffleEnabled: false,
  synchronizedAt: 1_000
}

function createControls(): PlaybackControls {
  return {
    canToggleSaved: true,
    errorMessage: null,
    isCommandPending: false,
    isLibraryPending: false,
    isPlaybackOptionPending: false,
    isSaved: false,
    isSeekPending: false,
    isVolumePending: false,
    onCycleRepeat: vi.fn(),
    onNext: vi.fn(),
    onPauseOrResume: vi.fn(),
    onPrevious: vi.fn(),
    onSeek: vi.fn(),
    onCommitVolume: vi.fn().mockResolvedValue(undefined),
    onSetVolume: vi.fn(),
    onToggleSaved: vi.fn(),
    onToggleShuffle: vi.fn(),
    onToggleMute: vi.fn()
  }
}

const syncedLyrics: LyricsDisplayState = {
  status: 'synced',
  plainLines: ['Does it break your heart', 'The way it breaks mine'],
  syncedLines: [
    { startTimeMs: 0, text: 'Does it break your heart' },
    { startTimeMs: 10_000, text: 'The way it breaks mine' }
  ],
  wordSyncedLines: []
}

function renderTheme(
  isFullScreen: boolean,
  lyrics: LyricsDisplayState = { status: 'idle', plainLines: [], syncedLines: [] }
): { onExitFullScreen: () => void } {
  const onExitFullScreen = vi.fn()
  const props: PlayerThemeProps = {
    chrome: {
      accountMenu: isFullScreen ? null : <span>Conta</span>,
      connectionStatus: isFullScreen ? null : <span>Conectado</span>,
      fullscreenControl: isFullScreen ? null : <span>Tela cheia</span>,
      themeSelector: isFullScreen ? null : <span>Temas</span>
    },
    controls: createControls(),
    isFullScreen,
    onExitFullScreen,
    lyrics,
    playback,
    playbackStatus: 'ready',
    tracklist: {
      contextImageUrl: 'https://i.scdn.co/image/album-cover',
      contextName: 'Koi No Yokan',
      isPending: false,
      isPlayPending: false,
      onPlayTrack: vi.fn(),
      tracks: []
    }
  }

  render(<AmbientPlayerTheme {...props} />)

  return { onExitFullScreen }
}

describe('AmbientPlayerTheme', () => {
  it('shows the track details and both sliders in the windowed layout', () => {
    renderTheme(false)

    expect(screen.getByRole('heading', { name: 'Entombed' })).toBeVisible()
    expect(screen.getByRole('slider', { name: 'Posição da reprodução' })).toBeEnabled()
    expect(screen.getByRole('slider', { name: 'Volume' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Mostrar letra' })).toBeEnabled()
  })

  it('reduces the layout to cover, transport and volume in immersive mode', async () => {
    const user = userEvent.setup()
    renderTheme(false)

    await user.click(screen.getByRole('button', { name: 'Entrar no modo imersivo' }))

    expect(screen.getByRole('img', { name: 'Capa de Koi No Yokan' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Pausar' })).toBeEnabled()
    expect(screen.getByRole('slider', { name: 'Volume' })).toBeEnabled()
    // Sem texto no desenho, a faixa segue descrita para leitores de tela.
    expect(screen.getByText(/Entombed — Deftones — MacBook Pro/)).toBeInTheDocument()

    // O Figma não traz título nem barra de progresso no modo imersivo.
    expect(screen.queryByRole('heading', { name: 'Entombed' })).not.toBeInTheDocument()
    expect(screen.queryByRole('slider', { name: 'Posição da reprodução' })).not.toBeInTheDocument()
  })

  it('separates the app fullscreen button from the theme immersive toggle', async () => {
    const user = userEvent.setup()
    renderTheme(false)

    // O da moldura expande a janela e vive no canto; o do Figma, na barra de
    // transporte, só troca a apresentação do tema.
    expect(screen.getByText('Tela cheia')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Entrar no modo imersivo' }))

    expect(screen.getByText('Tela cheia')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sair do modo imersivo' })).toBeEnabled()
  })

  it('swaps the whole layout for the lyrics stage when the letter is toggled on', async () => {
    const user = userEvent.setup()
    renderTheme(false, syncedLyrics)

    await user.click(screen.getByRole('button', { name: 'Mostrar letra' }))

    expect(screen.getByText('The way it breaks mine')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Pausar' })).toBeEnabled()
    expect(screen.getByRole('slider', { name: 'Volume' })).toBeEnabled()

    // O Figma reduz o modo letra à letra mais capa, transporte e volume.
    expect(screen.queryByRole('heading', { name: 'Entombed' })).not.toBeInTheDocument()
    expect(screen.queryByRole('slider', { name: 'Posição da reprodução' })).not.toBeInTheDocument()
  })

  it('marks the line playing right now so it can be styled as the active one', async () => {
    const user = userEvent.setup()
    renderTheme(false, syncedLyrics)

    await user.click(screen.getByRole('button', { name: 'Mostrar letra' }))

    // A reprodução está em 12s, ou seja, na segunda linha.
    expect(screen.getByText('The way it breaks mine').closest('p')).toHaveAttribute(
      'data-state',
      'active'
    )
    expect(screen.getByText('Does it break your heart').closest('p')).toHaveAttribute(
      'data-state',
      'rest'
    )
  })

  it('offers a way back out of full screen, since the app chrome is hidden there', async () => {
    const user = userEvent.setup()
    const { onExitFullScreen } = renderTheme(true)

    await user.click(screen.getByRole('button', { name: 'Sair da tela cheia' }))

    expect(onExitFullScreen).toHaveBeenCalledOnce()
  })

  it('drops the immersive mode when the lyrics take over the screen', async () => {
    const user = userEvent.setup()
    renderTheme(false, syncedLyrics)

    await user.click(screen.getByRole('button', { name: 'Entrar no modo imersivo' }))
    await user.click(screen.getByRole('button', { name: 'Mostrar letra' }))

    expect(screen.getByText('The way it breaks mine')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Entrar no modo imersivo' })).toBeEnabled()
  })
})
