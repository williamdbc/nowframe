import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { PlaybackState } from '@/features/playback/types/playback-state'
import type { PlaybackControls, PlayerThemeProps } from '@/features/themes/core/types/player-theme'

import { RocketLeaguePlayerTheme } from './rocket-league-player-theme'

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
    name: 'Arena Speaker',
    supportsVolume: true,
    type: 'Computer',
    volumePercent: 72
  },
  isPlaying: true,
  item: {
    album: { id: 'album-id', uri: 'spotify:album:album-id' },
    collectionName: 'Random Access Memories',
    creatorNames: ['Daft Punk'],
    durationMs: 369_000,
    id: 'track-id',
    imageUrl: 'https://i.scdn.co/image/album-cover',
    title: 'Giorgio by Moroder',
    type: 'track',
    uri: 'spotify:track:trackid'
  },
  progressMs: 84_000,
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

function renderTheme(
  isFullScreen = false,
  playbackOverride: PlaybackState | null = playback
): {
  controls: PlaybackControls
  onExitFullScreen: () => void
} {
  const controls = createControls()
  const onExitFullScreen = vi.fn()
  const props: PlayerThemeProps = {
    chrome: {
      accountMenu: isFullScreen ? null : <span>Conta</span>,
      connectionStatus: isFullScreen ? null : <span>Conectado</span>,
      fullscreenControl: isFullScreen ? null : <span>Tela cheia</span>,
      themeSelector: isFullScreen ? null : <span>Temas</span>
    },
    controls,
    isFullScreen,
    onExitFullScreen,
    lyrics: { status: 'idle', plainLines: [], syncedLines: [] },
    playback: playbackOverride,
    playbackStatus: 'ready',
    tracklist: {
      contextImageUrl: null,
      contextName: '',
      isPending: false,
      isPlayPending: false,
      onPlayTrack: vi.fn(),
      tracks: []
    }
  }

  render(<RocketLeaguePlayerTheme {...props} />)
  return { controls, onExitFullScreen }
}

describe('RocketLeaguePlayerTheme', () => {
  it('presents playback as a blue versus orange arena broadcast', () => {
    renderTheme()

    expect(screen.getByRole('region', { name: 'Placar da arena' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'Arena musical' })).toBeVisible()
    expect(screen.getByText('BLUE')).toBeVisible()
    expect(screen.getByText('ORANGE')).toBeVisible()
    expect(screen.getByText('BOOST')).toBeVisible()
    expect(screen.getByAltText('Capa de Random Access Memories')).toBeVisible()
    expect(screen.getByRole('heading', { level: 1, name: 'Giorgio by Moroder' })).toBeVisible()
  })

  it('dispatches transport and library actions', async () => {
    const user = userEvent.setup()
    const { controls } = renderTheme()

    await user.click(screen.getByRole('button', { name: 'Pausar' }))
    await user.click(screen.getByRole('button', { name: 'Próxima faixa' }))
    await user.click(screen.getByRole('button', { name: 'Adicionar à biblioteca' }))

    expect(controls.onPauseOrResume).toHaveBeenCalledOnce()
    expect(controls.onNext).toHaveBeenCalledOnce()
    expect(controls.onToggleSaved).toHaveBeenCalledOnce()
  })

  it('offers fullscreen exit and a no-cover fallback', async () => {
    const user = userEvent.setup()
    const { onExitFullScreen } = renderTheme(true, {
      ...playback,
      item: { ...playback.item!, imageUrl: null }
    })

    expect(screen.getByText('Nenhuma capa de álbum disponível')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Sair da tela cheia' }))
    expect(onExitFullScreen).toHaveBeenCalledOnce()
  })
})
