import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { PlaybackState } from '@/features/playback/types/playback-state'
import { playbackClock } from '@/features/playback/utils/playback-clock'
import type { PlaybackControls, PlayerThemeProps } from '@/features/themes/core/types/player-theme'

import { CassettePlayerTheme } from './cassette-player-theme'

const durationMs = 240_000

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
    durationMs,
    id: 'track-id',
    imageUrl: 'https://i.scdn.co/image/album-cover',
    title: 'Entombed',
    type: 'track',
    uri: 'spotify:track:trackid'
  },
  progressMs: 0,
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
  container: HTMLElement
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

  const { container } = render(<CassettePlayerTheme {...props} />)

  return { container, controls, onExitFullScreen }
}

function anchorClockAt(progressMs: number): void {
  playbackClock.setAnchor({
    durationMs,
    isPlaying: false,
    itemKey: 'track:track-id',
    progressMs,
    synchronizedAt: Date.now()
  })
}

afterEach(() => {
  playbackClock.setAnchor(null)
})

describe('CassettePlayerTheme', () => {
  it('presents the current track as a physical cassette label', () => {
    const { container } = renderTheme()

    expect(screen.getByRole('region', { name: 'Fita cassete em reprodução' })).toBeVisible()
    expect(screen.getByAltText('Capa de Koi No Yokan')).toBeVisible()
    expect(screen.getByRole('heading', { level: 1, name: 'Entombed' })).toBeVisible()
    expect(screen.getByText('Deftones')).toBeVisible()
    expect(container.querySelectorAll('.cassette-reel')).toHaveLength(2)
  })

  it('moves tape from the left reel to the right reel with playback progress', () => {
    anchorClockAt(durationMs / 2)
    const { container } = renderTheme()
    const cassette = container.querySelector('.cassette-shell') as HTMLElement

    expect(cassette.style.getPropertyValue('--cassette-progress')).toBe('0.5')
    expect(cassette.style.getPropertyValue('--cassette-left-tape-size')).toBe('46px')
    expect(cassette.style.getPropertyValue('--cassette-right-tape-size')).toBe('46px')
  })

  it('rotates both reel hubs from the shared playback clock', () => {
    anchorClockAt(3_000)
    const { container } = renderTheme()
    const cassette = container.querySelector('.cassette-shell') as HTMLElement

    expect(cassette.style.getPropertyValue('--cassette-reel-turn')).toBe('180deg')
  })

  it('dispatches transport and library actions', async () => {
    const user = userEvent.setup()
    const { controls } = renderTheme()

    await user.click(screen.getByRole('button', { name: 'Próxima faixa' }))
    await user.click(screen.getByRole('button', { name: 'Adicionar à biblioteca' }))

    expect(controls.onNext).toHaveBeenCalledOnce()
    expect(controls.onToggleSaved).toHaveBeenCalledOnce()
  })

  it('offers a fullscreen exit and a no-cover fallback', async () => {
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
