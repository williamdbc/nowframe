import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { PlaybackState } from '@/features/playback/types/playback-state'
import type { PlaybackControls, PlayerThemeProps } from '@/features/themes/core/types/player-theme'

import { SpotlightPlayerTheme } from './spotlight-player-theme'

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

function renderTheme(isFullScreen = false): { onExitFullScreen: () => void } {
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
    lyrics: { status: 'idle', plainLines: [], syncedLines: [] },
    playback,
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

  render(<SpotlightPlayerTheme {...props} />)

  return { onExitFullScreen }
}

describe('SpotlightPlayerTheme', () => {
  it('stacks the cover, the track details and both sliders in a single column', () => {
    renderTheme()

    expect(screen.getByRole('img', { name: 'Capa de This is Deftones' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Entombed' })).toBeVisible()
    expect(screen.getByText('This is Deftones')).toBeVisible()
    expect(screen.getByRole('slider', { name: 'Posição da reprodução' })).toBeEnabled()
    expect(screen.getByRole('slider', { name: 'Volume' })).toBeEnabled()
  })

  it('gives play/pause the same button treatment as the other transport controls', async () => {
    const user = userEvent.setup()
    renderTheme()

    // Diferente do Ambient, onde o play é uma pílula branca à parte, aqui ele
    // divide o estado de hover e o disabled com os vizinhos.
    const pauseButton = screen.getByRole('button', { name: 'Pausar' })
    expect(pauseButton).toHaveClass('spotlight-control')
    expect(screen.getByRole('button', { name: 'Faixa anterior' })).toHaveClass('spotlight-control')

    await user.click(pauseButton)
    expect(screen.getByRole('button', { name: 'Faixa anterior' })).toBeEnabled()
  })

  it('keeps the library toggle next to the track title, where the design puts it', async () => {
    const user = userEvent.setup()
    const controls = createControls()
    render(
      <SpotlightPlayerTheme
        chrome={{
          accountMenu: <span>Conta</span>,
          connectionStatus: <span>Conectado</span>,
          fullscreenControl: <span>Tela cheia</span>,
          themeSelector: <span>Temas</span>
        }}
        controls={controls}
        isFullScreen={false}
        lyrics={{ status: 'idle', plainLines: [], syncedLines: [] }}
        onExitFullScreen={vi.fn()}
        playback={playback}
        playbackStatus="ready"
        tracklist={{
          contextImageUrl: null,
          contextName: 'This is Deftones',
          isPending: false,
          isPlayPending: false,
          onPlayTrack: vi.fn(),
          tracks: []
        }}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Adicionar à biblioteca' }))
    expect(controls.onToggleSaved).toHaveBeenCalledOnce()
  })

  it('caps the title at two lines and the album at one', () => {
    renderTheme()

    // Sem layout no jsdom, o recorte só dá para conferir pela classe que o
    // aplica — títulos e álbuns longos passariam a empurrar o transporte para
    // fora da janela sem ela.
    expect(screen.getByRole('heading', { name: 'Entombed' })).toHaveClass('spotlight-title')
    expect(screen.getByText('This is Deftones')).toHaveClass('truncate')
  })

  it('offers a way back out of full screen, since the app chrome is hidden there', async () => {
    const user = userEvent.setup()
    const { onExitFullScreen } = renderTheme(true)

    await user.click(screen.getByRole('button', { name: 'Sair da tela cheia' }))

    expect(onExitFullScreen).toHaveBeenCalledOnce()
  })
})
