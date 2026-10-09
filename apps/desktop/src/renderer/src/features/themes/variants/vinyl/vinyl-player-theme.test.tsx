import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { PlaybackState } from '@/features/playback/types/playback-state'
import { playbackClock } from '@/features/playback/utils/playback-clock'
import type { PlaybackControls, PlayerThemeProps } from '@/features/themes/core/types/player-theme'

import { VinylPlayerTheme } from './vinyl-player-theme'

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

  const { container } = render(<VinylPlayerTheme {...props} />)

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
  const record = container.querySelector('.vinyl-record') as HTMLElement
  return Number.parseFloat(record.style.getPropertyValue('--vinyl-rotation'))
}

afterEach(() => {
  playbackClock.setAnchor(null)
})

describe('VinylPlayerTheme', () => {
  it('puts the cover on the record label and repeats it in the bar', () => {
    const { container } = renderTheme()

    expect(screen.getByAltText('Capa de Koi No Yokan')).toBeVisible()
    expect(container.querySelector('.vinyl-sleeve-image')).toHaveAttribute('alt', '')
    expect(screen.getByRole('heading', { level: 1, name: 'Entombed' })).toBeVisible()
    expect(screen.getByText('Deftones')).toBeVisible()
    expect(screen.getByRole('slider', { name: 'Posição da reprodução' })).toBeVisible()
  })

  it('turns the whole record, not only the label', () => {
    const { container } = renderTheme()
    const record = container.querySelector('.vinyl-record') as HTMLElement
    const turn = record.querySelector('.vinyl-record-turn') as HTMLElement

    expect([...record.children]).toEqual([turn])
    expect(turn.querySelector('.vinyl-record-sweep--light')).toBeInTheDocument()
    expect(turn.querySelector('.vinyl-record-sweep--shade')).toBeInTheDocument()
    expect(turn.querySelector('.vinyl-label')).toBeInTheDocument()
    expect(turn.querySelectorAll('.vinyl-groove')).toHaveLength(4)
    expect(turn.querySelectorAll('.vinyl-groove[data-filled="true"]')).toHaveLength(1)
  })

  it('starts the record unturned', () => {
    anchorClockAt(0, false)
    const { container } = renderTheme()

    expect(readRotationDegrees(container)).toBeCloseTo(0, 0)
  })

  it('has the record half turned at half a revolution of playback', () => {
    anchorClockAt(10_000, false)
    const { container } = renderTheme()

    expect(readRotationDegrees(container)).toBeCloseTo(180, 0)
  })

  it('has the record three quarters turned at three quarters of a revolution', () => {
    anchorClockAt(15_000, false)
    const { container } = renderTheme()

    expect(readRotationDegrees(container)).toBeCloseTo(270, 0)
  })

  it('wraps the angle instead of letting it grow without bound', () => {
    anchorClockAt(20_000, false)
    const { container } = renderTheme()
    expect(readRotationDegrees(container)).toBeCloseTo(0, 0)

    playbackClock.setAnchor(null)
    anchorClockAt(230_000, false)
    const later = renderTheme()
    expect(readRotationDegrees(later.container)).toBeCloseTo(180, 0)
  })

  it('keeps the record still when nothing is playing', () => {
    playbackClock.setAnchor(null)
    const { container } = renderTheme()

    expect(readRotationDegrees(container)).toBe(0)
  })

  it('falls back to a black record while the cover has not been sampled', () => {
    const { container } = renderTheme()
    const root = container.querySelector('.vinyl-root') as HTMLElement

    expect(root.style.getPropertyValue('--vinyl-record-color')).toBe('#1b1a19')
    expect(root.style.getPropertyValue('--vinyl-groove')).toBe('#5f5f5f')
  })

  it('keeps the volume slider behind a panel', async () => {
    const user = userEvent.setup()
    renderTheme()

    expect(screen.queryByRole('slider', { name: 'Volume' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Volume' }))

    expect(screen.getByRole('dialog', { name: 'Volume' })).toBeVisible()
    expect(screen.getByRole('slider', { name: 'Volume' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Silenciar' })).toBeEnabled()
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
    await user.click(screen.getByRole('button', { name: 'Adicionar à biblioteca' }))

    expect(controls.onNext).toHaveBeenCalledOnce()
    expect(controls.onPauseOrResume).toHaveBeenCalledOnce()
    expect(controls.onToggleSaved).toHaveBeenCalledOnce()
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

    expect(screen.getByText('Koi No Yokan')).toBeInTheDocument()
    expect(screen.getByText('MacBook Pro')).toBeInTheDocument()
  })
})
