import { Disc3 } from 'lucide-react'

import { PlaybackErrorMessage } from '@/features/playback/components/playback-error-message'
import { PlaybackProgressControl } from '@/features/playback/components/playback-progress-control'
import type { PlayerThemeProps } from '@/features/themes/core/types/player-theme'
import { getPlayerThemeContent } from '@/features/themes/core/utils/get-player-theme-content'
import { FullscreenExitControl } from '@/features/window-controls/components/fullscreen-exit-control'

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

  const trackKey = item?.id ?? content.title

  const accentColor = usePosterAccentColor(content.imageUrl)
  const readableTextColor = getReadableTextColor(accentColor)

  return (
    <main
      className="player-theme-root poster-root relative h-screen overflow-hidden"
      data-contrast={readableTextColor.isDark ? 'dark-on-light' : 'light-on-dark'}
      style={
        {
          '--poster-accent-rgb': toRgbChannels(accentColor),
          '--poster-on-accent-rgb': toRgbChannels(readableTextColor.color)
        } as React.CSSProperties
      }
    >
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

      <div className="player-theme-chrome poster-chrome fixed top-6 left-6 z-20">
        {chrome.connectionStatus}
      </div>
      <nav
        className="player-theme-chrome poster-chrome fixed top-6 right-6 z-20 flex items-start gap-2"
        aria-label="Ações do display"
      >
        {chrome.themeSelector}
        {chrome.accountMenu}
        {isFullScreen ? (
          <FullscreenExitControl
            className="poster-nav-button"
            onExitFullScreen={onExitFullScreen}
          />
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
