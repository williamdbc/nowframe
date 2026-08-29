import { Disc3, Music2 } from 'lucide-react'

import { ConceptPlaybackHud } from '@/features/themes/core/components/concept-playback-hud'
import { ConceptThemeChrome } from '@/features/themes/core/components/concept-theme-chrome'
import { InteractiveTrackRail } from '@/features/themes/core/components/interactive-track-rail'
import type { PlayerThemeProps } from '@/features/themes/core/types/player-theme'
import { getPlayerThemeContent } from '@/features/themes/core/utils/get-player-theme-content'
import '@/features/themes/core/components/concept-theme-controls.css'

import './jukebox-player-theme.css'

export function JukeboxPlayerTheme({
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
    <main className="player-theme-root jukebox-root">
      <ConceptThemeChrome
        chrome={chrome}
        exitClassName="jukebox-fullscreen-button"
        isFullScreen={isFullScreen}
        onExitFullScreen={onExitFullScreen}
      />
      <div aria-hidden="true" className="jukebox-neon-glow" />
      <div className="jukebox-machine">
        <div className="jukebox-arch">
          <span aria-hidden="true" className="jukebox-tube jukebox-tube--outer" />
          <span aria-hidden="true" className="jukebox-tube jukebox-tube--inner" />
          <section className="jukebox-now" aria-label="Seleção atual da jukebox">
            <div className="jukebox-cover">
              {content.imageUrl ? (
                <img
                  src={content.imageUrl}
                  alt={`Capa de ${content.collectionName ?? content.title}`}
                />
              ) : (
                <Disc3 aria-hidden="true" />
              )}
            </div>
            <div className="jukebox-marquee">
              <span>NOW PLAYING</span>
              <h1>{content.title}</h1>
              <p>{content.creatorNames}</p>
              {content.collectionName && <small>{content.collectionName}</small>}
            </div>
          </section>

          <InteractiveTrackRail
            className="jukebox-selector"
            contextName={tracklist.contextName}
            currentTrackId={item?.id ?? null}
            isPending={tracklist.isPending}
            isPlayPending={tracklist.isPlayPending}
            onPlayTrack={tracklist.onPlayTrack}
            tracks={tracklist.tracks}
            renderTrack={(track, isCurrent) => (
              <span className="jukebox-card" data-current={isCurrent}>
                <span className="jukebox-number">
                  {String(track.position + 1).padStart(2, '0')}
                </span>
                <Music2 aria-hidden="true" />
                <strong>{track.title}</strong>
              </span>
            )}
          />
        </div>

        <ConceptPlaybackHud
          accentColor="#ff356d"
          controls={controls}
          playback={playback}
          volumeLabel="VOL"
        />
      </div>
    </main>
  )
}
