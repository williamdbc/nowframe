import { Disc3, Minimize2 } from 'lucide-react'

import { PlaybackErrorMessage } from '@/features/playback/components/playback-error-message'
import { PlaybackProgressControl } from '@/features/playback/components/playback-progress-control'
import type { PlaybackControls, PlayerThemeProps } from '@/features/themes/core/types/player-theme'
import { getPlayerThemeContent } from '@/features/themes/core/utils/get-player-theme-content'

import savedIcon from './assets/saved.svg'
import { SpotlightRevealedText } from './components/spotlight-revealed-text'
import { SpotlightTransportControls } from './components/spotlight-transport-controls'
import { SpotlightVolumeControl } from './components/spotlight-volume-control'
import './spotlight-player-theme.css'

function SpotlightCover({
  collectionName,
  imageUrl,
  title
}: {
  collectionName: string | null
  imageUrl: string | null
  title: string
}): React.JSX.Element {
  return (
    <div className="spotlight-cover relative shrink-0">
      {imageUrl ? (
        <img
          key={imageUrl}
          src={imageUrl}
          alt={`Capa de ${collectionName ?? title}`}
          className="spotlight-cover-image size-full rounded-[inherit] object-cover"
        />
      ) : (
        <div className="flex size-full items-center justify-center rounded-[inherit] bg-white/[0.04]">
          <Disc3 aria-hidden="true" className="size-1/3 text-white/12" />
          <span className="sr-only">Nenhuma capa de álbum disponível</span>
        </div>
      )}
      <div
        aria-hidden="true"
        className="spotlight-cover-sheen absolute inset-0 rounded-[inherit]"
      />
    </div>
  )
}

function SpotlightSavedButton({
  controls,
  hasItem
}: {
  controls: PlaybackControls
  hasItem: boolean
}): React.JSX.Element {
  return (
    <button
      className="spotlight-control spotlight-control--sm spotlight-control--saved shrink-0"
      type="button"
      aria-label={controls.isSaved ? 'Remover da biblioteca' : 'Adicionar à biblioteca'}
      aria-pressed={controls.isSaved}
      data-active={controls.isSaved}
      disabled={!hasItem || !controls.canToggleSaved || controls.isLibraryPending}
      onClick={controls.onToggleSaved}
    >
      <img alt="" aria-hidden="true" className="size-full" src={savedIcon} />
    </button>
  )
}

export function SpotlightPlayerTheme({
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
    <main className="spotlight-root group relative flex h-screen overflow-x-hidden overflow-y-auto px-[24px] py-[32px]">
      {/* O fundo do Figma é a própria capa, ampliada e desfocada. */}
      {content.imageUrl && (
        <div aria-hidden="true" className="spotlight-backdrop">
          <img
            key={content.imageUrl}
            src={content.imageUrl}
            alt=""
            className="spotlight-backdrop-image"
          />
          <div className="spotlight-backdrop-veil" />
        </div>
      )}

      <div className="spotlight-chrome fixed top-6 left-6 z-20">{chrome.connectionStatus}</div>
      <nav
        className="spotlight-chrome fixed top-6 right-6 z-20 flex items-start gap-2"
        aria-label="Ações do display"
      >
        {chrome.themeSelector}
        {chrome.accountMenu}
        {/* Em tela cheia a moldura do app não entrega chrome nenhum, então a
            saída fica por conta do tema — é o único caminho de volta. */}
        {isFullScreen ? (
          <button
            className="spotlight-nav-button"
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

      <section key={trackKey} className="spotlight-stack">
        <SpotlightCover
          collectionName={content.collectionName}
          imageUrl={content.imageUrl}
          title={content.title}
        />

        <div className="spotlight-content">
          <div className="flex flex-col gap-[var(--spotlight-line-gap)]">
            {content.collectionName && (
              <p className="max-w-full self-start truncate rounded-[4px] bg-white/12 px-[6px] py-[2px] text-[length:var(--spotlight-label-size)] leading-[1.334] font-medium tracking-[-0.01em] text-white">
                {content.collectionName}
              </p>
            )}
            <div className="flex items-center gap-[16px]">
              <div className="flex min-w-px flex-1 flex-col gap-[4px] text-white">
                <h1 className="spotlight-title text-[length:var(--spotlight-title-size)] leading-[1.25] font-semibold tracking-[-0.018em]">
                  <SpotlightRevealedText text={content.title} />
                </h1>
                <p className="truncate text-[length:var(--spotlight-body-size)] leading-[1.286] font-medium tracking-[-0.01em] opacity-80">
                  <SpotlightRevealedText text={content.creatorNames} />
                </p>
              </div>
              <SpotlightSavedButton controls={controls} hasItem={Boolean(item)} />
            </div>
          </div>

          <PlaybackProgressControl
            accentColor="rgba(255,255,255,0.9)"
            canSeek={Boolean(item && playback?.capabilities.canSeek)}
            className="flex flex-col gap-[var(--spotlight-meta-gap)]"
            durationMs={item?.durationMs ?? 0}
            isPending={controls.isSeekPending}
            onSeek={controls.onSeek}
            positionMs={playback?.progressMs ?? 0}
            rangeClassName="spotlight-progress-range"
            timeClassName="flex justify-between text-[length:var(--spotlight-time-size)] leading-[1.4] font-medium tracking-[-0.01em] text-white tabular-nums"
            trackColor="rgba(255,255,255,0.12)"
          />

          <SpotlightTransportControls controls={controls} playback={playback} />

          <SpotlightVolumeControl
            canSetVolume={playback?.capabilities.canSetVolume ?? false}
            isPending={controls.isVolumePending}
            onCommitVolume={controls.onCommitVolume}
            onSetVolume={controls.onSetVolume}
            onToggleMute={controls.onToggleMute}
            volumePercent={playback?.device.volumePercent ?? null}
          />
        </div>

        {/* O desenho não mostra o dispositivo; o leitor de tela continua sabendo
            onde a faixa está tocando. */}
        {playback && <span className="sr-only">{playback.device.name}</span>}

        {controls.errorMessage && (
          <PlaybackErrorMessage
            key={controls.errorMessage}
            className="text-[length:var(--spotlight-label-size)] leading-[1.334] font-medium text-red-200"
            message={controls.errorMessage}
          />
        )}
      </section>
    </main>
  )
}
