import { Disc3 } from 'lucide-react'

import { ConceptPlaybackHud } from '@/features/themes/core/components/concept-playback-hud'
import { ConceptThemeChrome } from '@/features/themes/core/components/concept-theme-chrome'
import { InteractiveTrackRail } from '@/features/themes/core/components/interactive-track-rail'
import type { PlayerThemeProps } from '@/features/themes/core/types/player-theme'
import { getPlayerThemeContent } from '@/features/themes/core/utils/get-player-theme-content'
import '@/features/themes/core/components/concept-theme-controls.css'

import './timeline-player-theme.css'

function formatTrackDuration(durationMs: number): string {
  const seconds = Math.floor(durationMs / 1000)
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

export function TimelinePlayerTheme({
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
  const longestDuration = Math.max(...tracklist.tracks.map((track) => track.durationMs), 1)

  return (
    <main className="player-theme-root timeline-root">
      <ConceptThemeChrome
        chrome={chrome}
        exitClassName="timeline-fullscreen-button"
        isFullScreen={isFullScreen}
        onExitFullScreen={onExitFullScreen}
      />
      {content.imageUrl && (
        <img aria-hidden="true" alt="" className="timeline-backdrop" src={content.imageUrl} />
      )}
      <div className="timeline-stage">
        <header className="timeline-header">
          <div className="timeline-cover">
            {content.imageUrl ? (
              <img
                src={content.imageUrl}
                alt={`Capa de ${content.collectionName ?? content.title}`}
              />
            ) : (
              <Disc3 aria-hidden="true" />
            )}
          </div>
          <div>
            <span>PLAYBACK CHRONOLOGY</span>
            <h1>{content.title}</h1>
            <p>{content.creatorNames}</p>
            {content.collectionName && <small>{content.collectionName}</small>}
          </div>
        </header>

        <section className="timeline-chart" aria-label="Duração das faixas">
          <InteractiveTrackRail
            className="timeline-rail"
            contextName={tracklist.contextName}
            currentTrackId={item?.id ?? null}
            isPending={tracklist.isPending}
            isPlayPending={tracklist.isPlayPending}
            onPlayTrack={tracklist.onPlayTrack}
            tracks={tracklist.tracks}
            renderTrack={(track, isCurrent) => (
              <span
                className="timeline-segment"
                data-current={isCurrent}
                style={
                  {
                    '--timeline-weight': Math.max(0.38, track.durationMs / longestDuration)
                  } as React.CSSProperties
                }
              >
                <span className="timeline-marker" />
                <span className="timeline-index">
                  {String(track.position + 1).padStart(2, '0')}
                </span>
                <strong>{track.title}</strong>
                <small>{formatTrackDuration(track.durationMs)}</small>
              </span>
            )}
          />
        </section>

        <ConceptPlaybackHud
          accentColor="#ffcf5a"
          controls={controls}
          playback={playback}
          volumeLabel="GAIN"
        />
      </div>
    </main>
  )
}
