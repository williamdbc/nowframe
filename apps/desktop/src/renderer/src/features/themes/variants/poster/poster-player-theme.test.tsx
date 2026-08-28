import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { PlaybackState } from '@/features/playback/types/playback-state'
import type { PlaybackControls, PlayerThemeProps } from '@/features/themes/core/types/player-theme'

import { PosterPlayerTheme } from './poster-player-theme'

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
    collectionName: 'This is Deftones',
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

function renderTheme(
  isFullScreen = false,
  controlOverrides: Partial<PlaybackControls> = {},
  playbackOverride: PlaybackState | null = playback
): { controls: PlaybackControls; onExitFullScreen: () => void } {
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
      contextName: 'This is Deftones',
      isPending: false,
      isPlayPending: false,
      onPlayTrack: vi.fn(),
      tracks: []
    }
  }

  render(<PosterPlayerTheme {...props} />)

  return { controls, onExitFullScreen }
}

describe('PosterPlayerTheme', () => {
  it('lays the cover behind the track details, progress and transport', () => {
    renderTheme()

    expect(screen.getByAltText('Capa de This is Deftones')).toBeVisible()
    expect(screen.getByText('This is Deftones')).toBeVisible()
    expect(screen.getByRole('heading', { level: 1, name: 'Entombed' })).toBeVisible()
    expect(screen.getByRole('slider', { name: 'Posição da reprodução' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Pausar' })).toBeVisible()
  })

  it('keeps the times on either side of the progress bar', () => {
    renderTheme()

    expect(screen.getByText('3:14')).toBeVisible()
  })

  /** O volume não fica na tela: o ícone abre o painel desenhado no Figma. */
  it('opens the volume panel from the transport icon', async () => {
    const user = userEvent.setup()
    renderTheme()

    const trigger = screen.getByRole('button', { name: 'Volume' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('dialog', { name: 'Volume' })).not.toBeInTheDocument()

    await user.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const panel = screen.getByRole('dialog', { name: 'Volume' })
    expect(panel).toBeVisible()
    expect(screen.getByRole('slider', { name: 'Volume' })).toHaveValue('64')
  })

  it('closes the volume panel with Escape', async () => {
    const user = userEvent.setup()
    renderTheme()

    await user.click(screen.getByRole('button', { name: 'Volume' }))
    expect(screen.getByRole('dialog', { name: 'Volume' })).toBeVisible()

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog', { name: 'Volume' })).not.toBeInTheDocument()
  })

  it('does not open the volume panel when the device cannot set volume', () => {
    renderTheme(
      false,
      {},
      {
        ...playback,
        capabilities: { ...playback.capabilities, canSetVolume: false }
      }
    )

    expect(screen.getByRole('button', { name: 'Volume' })).toBeDisabled()
  })

  /**
   * A amostragem da capa usa canvas, que o jsdom não executa, então aqui vale o destaque
   * neutro: o que se verifica é que o tema publica os dois tokens e o lado do contraste,
   * que é o contrato que o CSS consome.
   */
  it('publishes the accent and readable colour as tokens on the root', () => {
    renderTheme()

    const root = document.querySelector('.poster-root') as HTMLElement

    expect(root.style.getPropertyValue('--poster-accent-rgb')).toBe('27 26 26')
    expect(root.style.getPropertyValue('--poster-on-accent-rgb')).toBe('255 255 255')
    expect(root).toHaveAttribute('data-contrast', 'light-on-dark')
  })

  /**
   * O arquivo do Figma traz o verde do Spotify assado no `fill`. Como <img> ele ignorava
   * a cor legível escolhida para a fileira e ficava verde sobre qualquer degradê, então
   * aqui ele tem de ser máscara em `currentColor` como os outros.
   */
  it('renders the saved icon as a mask so it follows the readable colour', () => {
    renderTheme()

    const saved = screen.getByRole('button', { name: 'Adicionar à biblioteca' })

    expect(saved.querySelector('img')).toBeNull()

    const glyph = saved.querySelector('.poster-icon') as HTMLElement
    expect(glyph).not.toBeNull()
    // O verde segue dentro do arquivo — o que importa é que ele agora está numa máscara,
    // que descarta a cor da fonte e pinta com o `currentColor` do botão.
    expect(glyph.style.maskImage).toContain('%231ED760')
    expect(glyph.style.maskImage).toContain('data:image/svg+xml')
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
