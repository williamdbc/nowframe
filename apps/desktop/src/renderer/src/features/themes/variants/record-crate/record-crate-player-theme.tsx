import { Disc3 } from 'lucide-react'

import { ConceptPlaybackHud } from '@/features/themes/core/components/concept-playback-hud'
import { ConceptThemeChrome } from '@/features/themes/core/components/concept-theme-chrome'
import { InteractiveTrackRail } from '@/features/themes/core/components/interactive-track-rail'
import type { PlayerThemeProps } from '@/features/themes/core/types/player-theme'
import { getPlayerThemeContent } from '@/features/themes/core/utils/get-player-theme-content'
import '@/features/themes/core/components/concept-theme-controls.css'

import './record-crate-player-theme.css'

export function RecordCratePlayerTheme({
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
    <main className="player-theme-root crate-root">
      <ConceptThemeChrome
        chrome={chrome}
        exitClassName="crate-fullscreen-button"
        isFullScreen={isFullScreen}
        onExitFullScreen={onExitFullScreen}
      />
      <div aria-hidden="true" className="crate-wall" />
      <div className="crate-stage">
        <header className="crate-header">
          <div className="crate-now-cover">
            {content.imageUrl ? (
              <img
                src={content.imageUrl}
                alt={`Capa de ${content.collectionName ?? content.title}`}
              />
            ) : (
              <Disc3 aria-hidden="true" />
            )}
            <span aria-hidden="true" className="crate-vinyl" />
          </div>
          <div>
            <span>NOW SPINNING</span>
            <h1>{content.title}</h1>
            <p>{content.creatorNames}</p>
            {content.collectionName && <small>{content.collectionName}</small>}
          </div>
        </header>

        <section className="crate-box" aria-label="Caixa de discos">
          <InteractiveTrackRail
            className="crate-rail"
            contextName={tracklist.contextName}
            currentTrackId={item?.id ?? null}
            isPending={tracklist.isPending}
            isPlayPending={tracklist.isPlayPending}
            onPlayTrack={tracklist.onPlayTrack}
            tracks={tracklist.tracks}
            renderTrack={(track, isCurrent) => (
              <span className="crate-sleeve" data-current={isCurrent}>
                <span className="crate-sleeve-art">
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
                <strong>{track.title}</strong>
              </span>
            )}
          />
          <span aria-hidden="true" className="crate-front">
            VINYL • SELECTOR
          </span>
        </section>

        <ConceptPlaybackHud
          accentColor="#d9a65a"
          controls={controls}
          playback={playback}
          volumeLabel="AMP"
        />
      </div>
    </main>
  )
}
