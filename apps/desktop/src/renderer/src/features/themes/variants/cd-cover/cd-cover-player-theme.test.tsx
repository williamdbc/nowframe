import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { PlaybackState } from '@/features/playback/types/playback-state'
import { playbackClock } from '@/features/playback/utils/playback-clock'
import type { PlaybackControls, PlayerThemeProps } from '@/features/themes/core/types/player-theme'

import { CdCoverPlayerTheme } from './cd-cover-player-theme'

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
  controlOverrides: Partial<PlaybackControls> = {},
  playbackOverride: PlaybackState | null = playback
): { container: HTMLElement; controls: PlaybackControls; onExitFullScreen: () => void } {
  const onExitFullScreen = vi.fn()
  const controls = { ...createControls(), ...controlOverrides }
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
      contextImageUrl: 'https://i.scdn.co/image/album-cover',
      contextName: 'Koi No Yokan',
      isPending: false,
      isPlayPending: false,
      onPlayTrack: vi.fn(),
      tracks: []
    }
  }

  const { container } = render(<CdCoverPlayerTheme {...props} />)

  return { container, controls, onExitFullScreen }
}

function anchorClockAt(progressMs: number, isPlaying = true): void {
  playbackClock.setAnchor({
    durationMs,
    isPlaying,
    itemKey: 'track:track-id',
    progressMs,
    synchronizedAt: Date.now()
  })
}

function readRotationDegrees(container: HTMLElement): number {
  const disc = container.querySelector('.cd-cover-disc') as HTMLElement
  return Number.parseFloat(disc.style.getPropertyValue('--cd-disc-rotation'))
}

afterEach(() => {
  playbackClock.setAnchor(null)
})

describe('CdCoverPlayerTheme', () => {
  it('stacks the sleeve, the disc and the panel below it', () => {
    const { container } = renderTheme()

    expect(screen.getByAltText('Capa de Koi No Yokan')).toBeVisible()
    expect(container.querySelector('.cd-cover-disc')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Entombed' })).toBeVisible()
    expect(screen.getByText('Deftones')).toBeVisible()
    expect(screen.getByRole('slider', { name: 'Posição da reprodução' })).toBeVisible()
    expect(screen.getByRole('slider', { name: 'Volume' })).toBeVisible()
  })

  /**
   * A particularidade do tema: o disco gira enquanto toca, em velocidade constante, e o
   * ângulo vem da posição de reprodução — não de uma animação de duração fixa.
   */
  it('starts the disc unturned', () => {
    anchorClockAt(0, false)
    const { container } = renderTheme()

    expect(readRotationDegrees(container)).toBeCloseTo(0, 0)
  })

  it('has the disc half turned at half a revolution of playback', () => {
    anchorClockAt(8_000, false)
    const { container } = renderTheme()

    expect(readRotationDegrees(container)).toBeCloseTo(180, 0)
  })

  it('has the disc three quarters turned at three quarters of a revolution', () => {
    anchorClockAt(12_000, false)
    const { container } = renderTheme()

    expect(readRotationDegrees(container)).toBeCloseTo(270, 0)
  })

  /** O ângulo é o resto da volta: numa faixa longa ele não cresce sem limite. */
  it('wraps the angle instead of letting it grow without bound', () => {
    anchorClockAt(16_000, false)
    const { container } = renderTheme()
    expect(readRotationDegrees(container)).toBeCloseTo(0, 0)

    // 200 s são 12 voltas e meia: as doze inteiras somem, sobra a meia volta.
    playbackClock.setAnchor(null)
    anchorClockAt(200_000, false)
    const later = renderTheme()
    expect(readRotationDegrees(later.container)).toBeCloseTo(180, 0)
  })

  it('keeps the disc still when nothing is playing', () => {
    playbackClock.setAnchor(null)
    const { container } = renderTheme()

    expect(readRotationDegrees(container)).toBe(0)
  })

  /**
   * O Figma desenha a fileira com aleatório, anterior, play, próxima e repetir — sem o
   * favorito. É a única capacidade que este tema não expõe, e está registrada como
   * exceção em `theme-contract.test.tsx`.
   */
  it('does not draw a saved control, matching the design', () => {
    renderTheme()

    expect(screen.queryByRole('button', { name: 'Adicionar à biblioteca' })).not.toBeInTheDocument()
    // O álbum não aparece na tela, mas o leitor de tela continua recebendo.
    expect(screen.getByText('Koi No Yokan')).toBeInTheDocument()
  })

  it('marks a pending option command as busy instead of dimming it', () => {
    renderTheme(false, { isPlaybackOptionPending: true })

    const shuffle = screen.getByRole('button', { name: 'Ativar modo aleatório' })

    expect(shuffle).toHaveAttribute('data-busy', 'true')
    expect(shuffle).toBeDisabled()
  })

  it('hands the transport commands to the shared controls', async () => {
    const user = userEvent.setup()
    const { controls } = renderTheme()

    await user.click(screen.getByRole('button', { name: 'Próxima faixa' }))
    await user.click(screen.getByRole('button', { name: 'Pausar' }))

    expect(controls.onNext).toHaveBeenCalledOnce()
    expect(controls.onPauseOrResume).toHaveBeenCalledOnce()
  })

  it('offers the only way back out of fullscreen', async () => {
    const user = userEvent.setup()
    const { onExitFullScreen } = renderTheme(true)

    await user.click(screen.getByRole('button', { name: 'Sair da tela cheia' }))

    expect(onExitFullScreen).toHaveBeenCalledOnce()
  })

  it('falls back to a placeholder when the content has no cover', () => {
    renderTheme(false, {}, { ...playback, item: { ...playback.item!, imageUrl: null } })

    expect(screen.getByText('Nenhuma capa de álbum disponível')).toBeInTheDocument()
  })
})
