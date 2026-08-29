import { PlaybackErrorMessage } from '@/features/playback/components/playback-error-message'
import { PlaybackProgressControl } from '@/features/playback/components/playback-progress-control'
import type { PlayerThemeProps } from '@/features/themes/core/types/player-theme'
import { getPlayerThemeContent } from '@/features/themes/core/utils/get-player-theme-content'
import { FullscreenExitControl } from '@/features/window-controls/components/fullscreen-exit-control'

import { CdCoverMedia } from './components/cd-cover-media'
import { CdCoverRevealedText } from './components/cd-cover-revealed-text'
import { CdCoverTransportControls } from './components/cd-cover-transport-controls'
import { CdCoverVolumeControl } from './components/cd-cover-volume-control'
import './cd-cover-player-theme.css'

export function CdCoverPlayerTheme({
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

  return (
    <main className="player-theme-root cd-cover-root relative flex h-screen overflow-x-hidden overflow-y-auto">
      {/* O fundo é a própria capa, muito ampliada e desfocada, sob um véu branco de 92%:
          sobra só um rastro de cor da arte sobre o cinza claro do tema. */}
      {content.imageUrl && (
        <div aria-hidden="true" className="cd-cover-backdrop">
          <img
            key={content.imageUrl}
            src={content.imageUrl}
            alt=""
            className="cd-cover-backdrop-image"
          />
          <div className="cd-cover-backdrop-veil" />
        </div>
      )}

      <div className="player-theme-chrome fixed top-6 left-6 z-20">{chrome.connectionStatus}</div>
      <nav
        className="player-theme-chrome fixed top-6 right-6 z-20 flex items-start gap-2"
        aria-label="Ações do display"
      >
        {chrome.themeSelector}
        {chrome.accountMenu}
        {/* Em tela cheia a moldura do app não entrega chrome nenhum, então a
            saída fica por conta do tema — é o único caminho de volta. */}
        {isFullScreen ? (
          <FullscreenExitControl
            className="cd-cover-nav-button"
            onExitFullScreen={onExitFullScreen}
          />
        ) : (
          chrome.fullscreenControl
        )}
      </nav>

      <section key={trackKey} className="cd-cover-stack">
        <CdCoverMedia
          collectionName={content.collectionName}
          imageUrl={content.imageUrl}
          title={content.title}
        />

        <div className="cd-cover-panel">
          <div className="cd-cover-details">
            {/* O Figma põe o artista acima do título, e menor. */}
            <p className="cd-cover-artist">
              <CdCoverRevealedText text={content.creatorNames} />
            </p>
            <h1 className="cd-cover-title">
              <CdCoverRevealedText text={content.title} />
            </h1>
          </div>

          <PlaybackProgressControl
            accentColor="#000000"
            canSeek={Boolean(item && playback?.capabilities.canSeek)}
            className="cd-cover-progress"
            durationMs={item?.durationMs ?? 0}
            isPending={controls.isSeekPending}
            onSeek={controls.onSeek}
            positionMs={playback?.progressMs ?? 0}
            rangeClassName="cd-cover-progress-range"
            timeClassName="cd-cover-progress-times"
            trackColor="rgba(0,0,0,0.12)"
          />

          <CdCoverTransportControls controls={controls} playback={playback} />

          <CdCoverVolumeControl
            canSetVolume={playback?.capabilities.canSetVolume ?? false}
            isPending={controls.isVolumePending}
            onCommitVolume={controls.onCommitVolume}
            onSetVolume={controls.onSetVolume}
            onToggleMute={controls.onToggleMute}
            volumePercent={playback?.device.volumePercent ?? null}
          />
        </div>

        {/* O desenho não mostra o álbum nem o dispositivo; o leitor de tela continua
            recebendo os dois. */}
        {content.collectionName && <span className="sr-only">{content.collectionName}</span>}
        {playback && <span className="sr-only">{playback.device.name}</span>}

        {controls.errorMessage && (
          <PlaybackErrorMessage
            key={controls.errorMessage}
            className="cd-cover-error"
            message={controls.errorMessage}
          />
        )}
      </section>
    </main>
  )
}
