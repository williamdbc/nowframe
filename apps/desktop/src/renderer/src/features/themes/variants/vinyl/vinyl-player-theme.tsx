import { PlaybackErrorMessage } from '@/features/playback/components/playback-error-message'
import { PlaybackProgressControl } from '@/features/playback/components/playback-progress-control'
import type { PlaybackControls, PlayerThemeProps } from '@/features/themes/core/types/player-theme'
import { getPlayerThemeContent } from '@/features/themes/core/utils/get-player-theme-content'
import { FullscreenExitControl } from '@/features/window-controls/components/fullscreen-exit-control'

import savedIcon from './assets/saved.svg'
import { VinylIcon } from './components/vinyl-icon'
import { VinylRecord } from './components/vinyl-record'
import { VinylRevealedText } from './components/vinyl-revealed-text'
import { VinylTransportControls } from './components/vinyl-transport-controls'
import { VinylVolumeControl } from './components/vinyl-volume-control'
import { useVinylRecordColor } from './hooks/useVinylRecordColor'
import './vinyl-player-theme.css'

function VinylSavedButton({
  controls,
  hasItem
}: {
  controls: PlaybackControls
  hasItem: boolean
}): React.JSX.Element {
  return (
    <button
      className="vinyl-control"
      type="button"
      aria-label={controls.isSaved ? 'Remover da biblioteca' : 'Adicionar à biblioteca'}
      aria-pressed={controls.isSaved}
      data-active={controls.isSaved}
      disabled={!hasItem || !controls.canToggleSaved || controls.isLibraryPending}
      onClick={controls.onToggleSaved}
    >
      <VinylIcon className="size-full" source={savedIcon} />
    </button>
  )
}

export function VinylPlayerTheme({
  chrome,
  controls,
  isFullScreen,
  onExitFullScreen,
  playback,
  playbackStatus
}: PlayerThemeProps): React.JSX.Element {
  const content = getPlayerThemeContent(playback, playbackStatus)
  const item = playback?.item ?? null
  // Remontar o bloco a cada faixa é o que dispara a entrada animada de novo. Aqui a chave
  // fica só no bloco de identificação: o disco e os controles atravessam a troca de faixa
  // inteiros, o disco para não reiniciar o giro e os controles para não perderem o foco.
  const trackKey = item?.id ?? content.title

  // As duas cores saem da capa; a transição entre elas fica no CSS, então trocar de faixa
  // vira uma virada de cor do disco e do fundo em vez de um corte seco.
  const recordColor = useVinylRecordColor(content.imageUrl)

  return (
    <main
      className="player-theme-root vinyl-root"
      style={
        {
          '--vinyl-groove': recordColor.groove,
          '--vinyl-record-color': recordColor.record
        } as React.CSSProperties
      }
    >
      <VinylRecord
        collectionName={content.collectionName}
        imageUrl={content.imageUrl}
        title={content.title}
      />

      <div className="player-theme-chrome fixed top-6 left-6 z-20">{chrome.connectionStatus}</div>
      <nav
        className="player-theme-chrome fixed top-6 right-6 z-20 flex items-start gap-2"
        aria-label="Ações do display"
      >
        {chrome.themeSelector}
        {chrome.accountMenu}
        {/* Em tela cheia a moldura do app não entrega chrome nenhum, então a saída fica por
            conta do tema — é o único caminho de volta. */}
        {isFullScreen ? (
          <FullscreenExitControl className="vinyl-nav-button" onExitFullScreen={onExitFullScreen} />
        ) : (
          chrome.fullscreenControl
        )}
      </nav>

      <footer className="vinyl-bar">
        <div className="vinyl-meta" key={trackKey}>
          <div className="vinyl-sleeve">
            {content.imageUrl ? (
              <img
                key={content.imageUrl}
                src={content.imageUrl}
                alt=""
                className="vinyl-sleeve-image"
              />
            ) : (
              <div className="vinyl-sleeve-placeholder" />
            )}
            <div aria-hidden="true" className="vinyl-sleeve-sheen" />
          </div>

          <div className="vinyl-details">
            {/* O Figma põe o artista acima do título, e menor. */}
            <p className="vinyl-artist">
              <VinylRevealedText text={content.creatorNames} />
            </p>
            <h1 className="vinyl-title">
              <VinylRevealedText text={content.title} />
            </h1>
          </div>
        </div>

        <div className="vinyl-controls">
          <VinylTransportControls controls={controls} playback={playback} />

          {/* Os tempos ficam nas pontas da barra, não abaixo dela. O controle compartilhado
              desenha o input e depois os dois tempos, então o CSS os recoloca na mesma
              fileira em vez de duplicar a lógica do controle. */}
          <PlaybackProgressControl
            accentColor="#ffffff"
            canSeek={Boolean(item && playback?.capabilities.canSeek)}
            className="vinyl-progress"
            durationMs={item?.durationMs ?? 0}
            isPending={controls.isSeekPending}
            onSeek={controls.onSeek}
            positionMs={playback?.progressMs ?? 0}
            rangeClassName="vinyl-progress-range"
            timeClassName="vinyl-progress-times"
            trackColor="rgba(255,255,255,0.12)"
          />
        </div>

        <div className="vinyl-actions">
          <VinylSavedButton controls={controls} hasItem={Boolean(item)} />

          <VinylVolumeControl
            canSetVolume={playback?.capabilities.canSetVolume ?? false}
            isPending={controls.isVolumePending}
            onCommitVolume={controls.onCommitVolume}
            onSetVolume={controls.onSetVolume}
            onToggleMute={controls.onToggleMute}
            volumePercent={playback?.device.volumePercent ?? null}
          />
        </div>
      </footer>

      {/* O desenho não mostra o álbum nem o dispositivo; o leitor de tela continua
          recebendo os dois. */}
      {content.collectionName && <span className="sr-only">{content.collectionName}</span>}
      {playback && <span className="sr-only">{playback.device.name}</span>}

      {controls.errorMessage && (
        <PlaybackErrorMessage
          key={controls.errorMessage}
          className="vinyl-error"
          message={controls.errorMessage}
        />
      )}
    </main>
  )
}
