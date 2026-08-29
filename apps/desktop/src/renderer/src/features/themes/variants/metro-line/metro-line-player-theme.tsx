import { Disc3, TrainFront } from 'lucide-react'

import { ConceptPlaybackHud } from '@/features/themes/core/components/concept-playback-hud'
import { ConceptThemeChrome } from '@/features/themes/core/components/concept-theme-chrome'
import { InteractiveTrackRail } from '@/features/themes/core/components/interactive-track-rail'
import type { PlayerThemeProps } from '@/features/themes/core/types/player-theme'
import { getPlayerThemeContent } from '@/features/themes/core/utils/get-player-theme-content'
import '@/features/themes/core/components/concept-theme-controls.css'

import './metro-line-player-theme.css'

export function MetroLinePlayerTheme({
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
    <main className="player-theme-root metro-root">
      <ConceptThemeChrome
        chrome={chrome}
        exitClassName="metro-fullscreen-button"
        isFullScreen={isFullScreen}
        onExitFullScreen={onExitFullScreen}
      />
      <div aria-hidden="true" className="metro-map-grid" />
      <div className="metro-stage">
        <header className="metro-header">
          <div className="metro-roundel">
            <TrainFront aria-hidden="true" />
          </div>
          <div className="metro-copy">
            <span>NOW ARRIVING</span>
            <h1>{content.title}</h1>
            <p>
              <span>{content.creatorNames}</span>
              <i>•</i>
              <span>{content.collectionName}</span>
            </p>
          </div>
          <div className="metro-ticket">
            {content.imageUrl ? (
              <img
                src={content.imageUrl}
                alt={`Capa de ${content.collectionName ?? content.title}`}
              />
            ) : (
              <Disc3 aria-hidden="true" />
            )}
          </div>
        </header>

        <section className="metro-network" aria-label="Linha de faixas">
          <InteractiveTrackRail
            className="metro-rail"
            contextName={tracklist.contextName}
            currentTrackId={item?.id ?? null}
            isPending={tracklist.isPending}
            isPlayPending={tracklist.isPlayPending}
            onPlayTrack={tracklist.onPlayTrack}
            tracks={tracklist.tracks}
            renderTrack={(track, isCurrent) => (
              <span className="metro-stop" data-current={isCurrent}>
                <span className="metro-station-dot">
                  <span>{track.position + 1}</span>
                </span>
                <strong>{track.title}</strong>
              </span>
            )}
          />
        </section>

        <ConceptPlaybackHud
          accentColor="#ef3340"
          controls={controls}
          playback={playback}
          volumeLabel="LEVEL"
        />
      </div>
    </main>
  )
}
