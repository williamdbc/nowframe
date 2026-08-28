import { Disc3, Minimize2 } from 'lucide-react'

import { PlaybackErrorMessage } from '@/features/playback/components/playback-error-message'
import { PlaybackProgressControl } from '@/features/playback/components/playback-progress-control'
import type { PlayerThemeProps } from '@/features/themes/core/types/player-theme'
import { getPlayerThemeContent } from '@/features/themes/core/utils/get-player-theme-content'

import { PosterRevealedText } from './components/poster-revealed-text'
import { PosterTransportControls } from './components/poster-transport-controls'
import { PosterVolumeControl } from './components/poster-volume-control'
import { usePosterAccentColor } from './hooks/usePosterAccentColor'
import { getReadableTextColor, toRgbChannels } from './utils/get-readable-text-color'
import './poster-player-theme.css'

export function PosterPlayerTheme({
  chrome,
  controls,
  isFullScreen,
  onExitFullScreen,
  playback,
  playbackStatus
}: PlayerThemeProps): React.JSX.Element {
  const content = getPlayerThemeContent(playback, playbackStatus)
  const item = playback?.item ?? null
  // Remontar o bloco a cada faixa é o que dispara a entrada animada de novo.
  const trackKey = item?.id ?? content.title

  // O degradê usa a cor da capa, então texto e ícones não podem ser brancos fixos: a
  // WCAG decide entre preto e branco a cada faixa.
  const accentColor = usePosterAccentColor(content.imageUrl)
  const readableTextColor = getReadableTextColor(accentColor)

  return (
    <main
      className="poster-root relative h-screen overflow-hidden"
      data-contrast={readableTextColor.isDark ? 'dark-on-light' : 'light-on-dark'}
      style={
        {
          '--poster-accent-rgb': toRgbChannels(accentColor),
          '--poster-on-accent-rgb': toRgbChannels(readableTextColor.color)
        } as React.CSSProperties
      }
    >
      {/* A capa é o fundo inteiro, sem desfoque: é o desenho do tema. O degradê
          embaixo assenta na cor média da própria arte, e é contra essa cor que o
          contraste do texto é decidido. */}
      {content.imageUrl ? (
        <img
          key={content.imageUrl}
          src={content.imageUrl}
          alt={`Capa de ${content.collectionName ?? content.title}`}
          className="poster-cover-image"
        />
      ) : (
        <div className="poster-cover-placeholder">
          <Disc3 aria-hidden="true" className="size-[15vh] text-white/12" />
          <span className="sr-only">Nenhuma capa de álbum disponível</span>
        </div>
      )}
      <div aria-hidden="true" className="poster-fade" />

      <div className="poster-chrome fixed top-6 left-6 z-20">{chrome.connectionStatus}</div>
      <nav
        className="poster-chrome fixed top-6 right-6 z-20 flex items-start gap-2"
        aria-label="Ações do display"
      >
        {chrome.themeSelector}
        {chrome.accountMenu}
        {/* Em tela cheia a moldura do app não entrega chrome nenhum, então a
            saída fica por conta do tema — é o único caminho de volta. */}
        {isFullScreen ? (
          <button
            className="poster-nav-button"
            type="button"
            aria-label="Sair da tela cheia"
            title="Sair da tela cheia"
            onClick={onExitFullScreen}
          >
            <Minimize2 aria-hidden="true" className="size-4" />
          </button>
        ) : (
          chrome.fullscreenControl
        )}
      </nav>

      <section key={trackKey} className="poster-stack">
        <div className="poster-details">
          {content.collectionName && <p className="poster-chip">{content.collectionName}</p>}
          <div className="poster-text">
            <h1 className="poster-title">
              <PosterRevealedText text={content.title} />
            </h1>
            <p className="poster-artist">
              <PosterRevealedText text={content.creatorNames} />
            </p>
          </div>
        </div>

        {/* Os tempos ficam nas pontas da barra, não abaixo dela. O controle
            compartilhado desenha `input` e depois os dois tempos, então o CSS os
            recoloca na mesma fileira em vez de duplicar a lógica do controle. */}
        <PlaybackProgressControl
          accentColor="rgb(var(--poster-on-accent-rgb))"
          canSeek={Boolean(item && playback?.capabilities.canSeek)}
          className="poster-progress"
          durationMs={item?.durationMs ?? 0}
          isPending={controls.isSeekPending}
          onSeek={controls.onSeek}
          positionMs={playback?.progressMs ?? 0}
          rangeClassName="poster-progress-range"
          timeClassName="poster-progress-times"
          trackColor="rgb(var(--poster-on-accent-rgb) / 0.12)"
        />

        <PosterTransportControls
          controls={controls}
          playback={playback}
          volumeControl={
            <PosterVolumeControl
              canSetVolume={playback?.capabilities.canSetVolume ?? false}
              isPending={controls.isVolumePending}
              onCommitVolume={controls.onCommitVolume}
              onSetVolume={controls.onSetVolume}
              onToggleMute={controls.onToggleMute}
              volumePercent={playback?.device.volumePercent ?? null}
            />
          }
        />

        {/* O desenho não mostra o dispositivo; o leitor de tela continua sabendo
            onde a faixa está tocando. */}
        {playback && <span className="sr-only">{playback.device.name}</span>}

        {controls.errorMessage && (
          <PlaybackErrorMessage
            key={controls.errorMessage}
            className="poster-error"
            message={controls.errorMessage}
          />
        )}
      </section>
    </main>
  )
}
