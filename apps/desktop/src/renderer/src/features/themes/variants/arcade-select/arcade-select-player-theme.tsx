import { Disc3, Gamepad2 } from 'lucide-react'

import { ConceptPlaybackHud } from '@/features/themes/core/components/concept-playback-hud'
import { ConceptThemeChrome } from '@/features/themes/core/components/concept-theme-chrome'
import type { PlayerThemeProps } from '@/features/themes/core/types/player-theme'
import { getPlayerThemeContent } from '@/features/themes/core/utils/get-player-theme-content'
import '@/features/themes/core/components/concept-theme-controls.css'

import { InteractiveTrackRail } from './components/interactive-track-rail'
import './arcade-select-player-theme.css'

export function ArcadeSelectPlayerTheme({
  chrome,
  controls,
  isFullScreen,
  onExitFullScreen,
  playback,
  playbackStatus,
  tracklist
}: PlayerThemeProps): React.JSX.Element {
  const content = getPlayerThemeContent(playback, playbackStatus)
  const item = playback?.item ?? null

  return (
    <main className="player-theme-root arcade-root">
      <ConceptThemeChrome
        chrome={chrome}
        exitClassName="arcade-fullscreen-button"
        isFullScreen={isFullScreen}
        onExitFullScreen={onExitFullScreen}
      />
      <div aria-hidden="true" className="arcade-grid" />
      <div className="arcade-stage">
        <header className="arcade-header">
          <Gamepad2 aria-hidden="true" />
          <span>MUSIC SELECT</span>
          <b>1 PLAYER</b>
        </header>
        <section className="arcade-current" aria-label="Seleção atual">
          <div className="arcade-rank">
            <span>NOW</span>
            <strong>01</strong>
          </div>
          <div className="arcade-cover">
            {content.imageUrl ? (
              <img
                src={content.imageUrl}
                alt={`Capa de ${content.collectionName ?? content.title}`}
              />
            ) : (
              <Disc3 aria-hidden="true" />
            )}
            <span aria-hidden="true" className="arcade-scanline" />
          </div>
          <div className="arcade-copy">
            <span>READY!</span>
            <h1>{content.title}</h1>
            <p>{content.creatorNames}</p>
            {content.collectionName && <small>{content.collectionName}</small>}
          </div>
        </section>

        <InteractiveTrackRail
          className="arcade-carousel"
          contextName={tracklist.contextName}
          currentTrackId={item?.id ?? null}
          isPending={tracklist.isPending}
          isPlayPending={tracklist.isPlayPending}
          onPlayTrack={tracklist.onPlayTrack}
          tracks={tracklist.tracks}
          renderTrack={(track, isCurrent) => (
            <span className="arcade-card" data-current={isCurrent}>
              <span className="arcade-card-art">
                {(track.imageUrl ?? tracklist.contextImageUrl ?? content.imageUrl) ? (
                  <img
                    src={
                      track.imageUrl ?? tracklist.contextImageUrl ?? content.imageUrl ?? undefined
                    }
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                  />
                ) : (
                  <Disc3 aria-hidden="true" />
                )}
              </span>
              <span className="arcade-card-index">
                {String(track.position + 1).padStart(2, '0')}
              </span>
              <strong>{track.title}</strong>
            </span>
          )}
        />

        <ConceptPlaybackHud
          accentColor="#39ffcf"
          controls={controls}
          playback={playback}
          volumeLabel="POWER"
        />
      </div>
    </main>
  )
}
