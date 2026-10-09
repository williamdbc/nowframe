import { Captions, Disc3 } from 'lucide-react'
import { useState } from 'react'

import { PlaybackErrorMessage } from '@/features/playback/components/playback-error-message'
import { PlaybackProgressControl } from '@/features/playback/components/playback-progress-control'
import type { PlayerThemeProps } from '@/features/themes/core/types/player-theme'
import { getPlayerThemeContent } from '@/features/themes/core/utils/get-player-theme-content'
import { FullscreenExitControl } from '@/features/window-controls/components/fullscreen-exit-control'

import { AmbientLyricsPanel } from './components/ambient-lyrics-panel'
import { AmbientRevealedText } from './components/ambient-revealed-text'
import { AmbientTransportControls } from './components/ambient-transport-controls'
import { AmbientVolumeControl } from './components/ambient-volume-control'
import { useDominantCoverColor } from './hooks/useDominantCoverColor'
import './ambient-player-theme.css'

function AmbientCover({
  className = '',
  collectionName,
  imageUrl,
  title
}: {
  className?: string
  collectionName: string | null
  imageUrl: string | null
  title: string
}): React.JSX.Element {
  return (
    <div className={`ambient-cover relative shrink-0 ${className}`}>
      {imageUrl ? (
        <img
          key={imageUrl}
          src={imageUrl}
          alt={`Capa de ${collectionName ?? title}`}
          className="ambient-cover-image size-full rounded-[inherit] object-cover"
        />
      ) : (
        <div className="flex size-full items-center justify-center rounded-[inherit] bg-white/[0.04]">
          <Disc3 aria-hidden="true" className="size-1/3 text-white/12" />
          <span className="sr-only">Nenhuma capa de álbum disponível</span>
        </div>
      )}
      <div aria-hidden="true" className="ambient-cover-sheen absolute inset-0 rounded-[inherit]" />
    </div>
  )
}

export function AmbientPlayerTheme({
  chrome,
  controls,
  isFullScreen,
  lyrics,
  onExitFullScreen,
  playback,
  playbackStatus
}: PlayerThemeProps): React.JSX.Element {
  const [showLyrics, setShowLyrics] = useState(false)
  const [isImmersive, setIsImmersive] = useState(false)
  const content = getPlayerThemeContent(playback, playbackStatus)
  const item = playback?.item ?? null
  const backdrop = useDominantCoverColor(content.imageUrl)

  const trackKey = item?.id ?? content.title

  const toggleLyrics = (): void => {
    setShowLyrics((isVisible) => !isVisible)
    setIsImmersive(false)
  }

  const toggleImmersive = (): void => {
    setIsImmersive((isOn) => !isOn)
    setShowLyrics(false)
  }

  const transportControls = (
    <AmbientTransportControls
      controls={controls}
      isImmersive={isImmersive}
      onToggleImmersive={toggleImmersive}
      playback={playback}
    />
  )

  const renderVolumeControl = (orientation: 'horizontal' | 'vertical'): React.JSX.Element => (
    <AmbientVolumeControl
      canSetVolume={playback?.capabilities.canSetVolume ?? false}
      isPending={controls.isVolumePending}
      onCommitVolume={controls.onCommitVolume}
      onSetVolume={controls.onSetVolume}
      onToggleMute={controls.onToggleMute}
      orientation={orientation}
      volumePercent={playback?.device.volumePercent ?? null}
    />
  )

  const errorMessage = controls.errorMessage ? (
    <PlaybackErrorMessage
      key={controls.errorMessage}
      className="text-[length:var(--ambient-label-size)] leading-[1.15] font-medium text-red-200"
      message={controls.errorMessage}
    />
  ) : null

  const windowChrome = (
    <>
      <div className="player-theme-chrome ambient-chrome fixed top-6 left-6 z-20">
        {chrome.connectionStatus}
      </div>
      <nav
        className="player-theme-chrome ambient-chrome fixed top-6 right-6 z-20 flex items-start gap-2"
        aria-label="Ações do display"
      >
        <button
          className="ambient-nav-button"
          type="button"
          aria-label={showLyrics ? 'Ocultar letra' : 'Mostrar letra'}
          aria-pressed={showLyrics}
          title={showLyrics ? 'Ocultar letra' : 'Mostrar letra'}
          onClick={toggleLyrics}
        >
          <Captions aria-hidden="true" className="size-4" />
        </button>
        {chrome.themeSelector}
        {chrome.accountMenu}
        {isFullScreen ? (
          <FullscreenExitControl
            className="ambient-nav-button"
            onExitFullScreen={onExitFullScreen}
          />
        ) : (
          chrome.fullscreenControl
        )}
      </nav>
    </>
  )

  if (isImmersive) {
    return (
      <main
        className="player-theme-root ambient-root ambient-root--immersive group relative min-h-screen overflow-hidden"
        style={{ backgroundColor: backdrop }}
      >
        {windowChrome}

        <section
          key={trackKey}
          className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-[var(--ambient-block-gap)]"
        >
          <AmbientCover
            collectionName={content.collectionName}
            imageUrl={content.imageUrl}
            title={content.title}
          />
          {transportControls}
          {renderVolumeControl('horizontal')}

          <span className="sr-only">
            {content.title} — {content.creatorNames}
            {playback ? ` — ${playback.device.name}` : ''}
          </span>
          {errorMessage}
        </section>
      </main>
    )
  }

  if (showLyrics) {
    return (
      <main
        className="player-theme-root ambient-root ambient-root--lyrics group relative min-h-screen overflow-hidden"
        style={{ backgroundColor: backdrop }}
      >
        {windowChrome}

        <section className="absolute top-1/2 left-1/2 flex w-[var(--ambient-lyrics-column)] -translate-x-1/2 -translate-y-1/2 flex-col items-start gap-[var(--ambient-lyrics-stage-gap)]">
          <AmbientLyricsPanel
            key={trackKey}
            isPlaying={playback?.isPlaying ?? false}
            lyrics={lyrics}
            positionMs={playback?.progressMs ?? 0}
          />

          <div className="flex w-full flex-col items-center gap-[var(--ambient-lyrics-bar-gap)]">
            <div className="flex w-full items-center">
              <AmbientCover
                className="ambient-cover--compact"
                collectionName={content.collectionName}
                imageUrl={content.imageUrl}
                title={content.title}
              />
              <div className="flex min-w-px flex-1 items-center justify-center">
                {transportControls}
              </div>
            </div>
            {renderVolumeControl('horizontal')}
          </div>

          <span className="sr-only">
            {content.title} — {content.creatorNames}
            {playback ? ` — ${playback.device.name}` : ''}
          </span>
          {errorMessage}
        </section>
      </main>
    )
  }

  return (
    <main
      className="player-theme-root ambient-root group relative min-h-screen overflow-hidden"
      style={{ backgroundColor: backdrop }}
    >
      {windowChrome}

      <section className="absolute top-1/2 left-1/2 flex w-[min(1024px,92vw)] -translate-x-1/2 -translate-y-1/2 items-center gap-[var(--ambient-column-gap)] px-[var(--ambient-column-gap)]">
        {renderVolumeControl('vertical')}

        <div className="flex min-w-px flex-1 items-center gap-[var(--ambient-column-gap)]">
          <AmbientCover
            collectionName={content.collectionName}
            imageUrl={content.imageUrl}
            title={content.title}
          />

          <div className="flex min-w-px flex-1 items-center py-[16px]">
            <div
              key={trackKey}
              className="flex min-w-px flex-1 flex-col gap-[var(--ambient-block-gap)]"
            >
              <div className="ambient-stagger flex flex-col gap-[24px]">
                {content.collectionName && (
                  <p className="max-w-full self-start truncate rounded-[4px] bg-white/12 px-[8px] py-[4px] text-[length:var(--ambient-label-size)] leading-[1.15] font-medium tracking-[-0.01em] text-white">
                    {content.collectionName}
                  </p>
                )}
                <div className="flex flex-col gap-[12px] text-white">
                  <h1 className="ambient-title text-[length:var(--ambient-title-size)] leading-[1.084] font-semibold tracking-[-0.018em]">
                    <AmbientRevealedText text={content.title} />
                  </h1>
                  <p className="text-[length:var(--ambient-body-size)] leading-[1.167] font-medium tracking-[-0.01em] opacity-80">
                    <AmbientRevealedText text={content.creatorNames} />
                  </p>
                </div>
              </div>

              <PlaybackProgressControl
                accentColor="#ffffff"
                canSeek={Boolean(item && playback?.capabilities.canSeek)}
                className="ambient-stagger grid grid-cols-[auto_1fr_auto] items-center gap-[15px]"
                durationMs={item?.durationMs ?? 0}
                isPending={controls.isSeekPending}
                onSeek={controls.onSeek}
                positionMs={playback?.progressMs ?? 0}
                rangeClassName="ambient-progress-range col-start-2 row-start-1"
                timeClassName="contents [&>span]:row-start-1 [&>span]:text-[length:var(--ambient-label-size)] [&>span]:leading-[1.15] [&>span]:font-medium [&>span]:tracking-[-0.01em] [&>span]:text-white [&>span]:tabular-nums [&>span:first-child]:col-start-1 [&>span:last-child]:col-start-3"
                trackColor="rgba(255,255,255,0.12)"
              />

              <div className="ambient-stagger">{transportControls}</div>

              {playback && <span className="sr-only">{playback.device.name}</span>}

              {errorMessage}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
