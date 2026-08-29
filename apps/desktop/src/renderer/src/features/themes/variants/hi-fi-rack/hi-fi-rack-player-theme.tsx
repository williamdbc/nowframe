import { Disc3 } from 'lucide-react'

import { ConceptPlaybackHud } from '@/features/themes/core/components/concept-playback-hud'
import { ConceptThemeChrome } from '@/features/themes/core/components/concept-theme-chrome'
import { InteractiveTrackRail } from '@/features/themes/core/components/interactive-track-rail'
import type { PlayerThemeProps } from '@/features/themes/core/types/player-theme'
import { getPlayerThemeContent } from '@/features/themes/core/utils/get-player-theme-content'
import '@/features/themes/core/components/concept-theme-controls.css'

import './hi-fi-rack-player-theme.css'

export function HiFiRackPlayerTheme({
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
    <main className="player-theme-root hifi-root">
      <ConceptThemeChrome
        chrome={chrome}
        exitClassName="hifi-fullscreen-button"
        isFullScreen={isFullScreen}
        onExitFullScreen={onExitFullScreen}
      />
      <div className="hifi-rack">
        <section className="hifi-unit hifi-unit--receiver" aria-label="Receiver Hi-Fi">
          <div className="hifi-brand">
            STEREO RECEIVER <strong>HF-900</strong>
          </div>
          <div className="hifi-screen">
            <span>NOW PLAYING</span>
            <h1>{content.title}</h1>
            <p>{content.creatorNames}</p>
            {content.collectionName && <small>{content.collectionName}</small>}
          </div>
          <div className="hifi-cover">
            {content.imageUrl ? (
              <img
                src={content.imageUrl}
                alt={`Capa de ${content.collectionName ?? content.title}`}
              />
            ) : (
              <Disc3 aria-hidden="true" />
            )}
          </div>
        </section>

        <section className="hifi-unit hifi-unit--meters" aria-label="Medidores de potência">
          <div className="hifi-meter">
            <span>L</span>
            <i />
            <b>POWER</b>
          </div>
          <div className="hifi-meter">
            <span>R</span>
            <i />
            <b>POWER</b>
          </div>
          <div className="hifi-eq" aria-hidden="true">
            {Array.from({ length: 18 }, (_, index) => (
              <span
                key={index}
                style={{ '--bar': `${25 + ((index * 37) % 70)}%` } as React.CSSProperties}
              />
            ))}
          </div>
          <div className="hifi-knob">
            <span>INPUT</span>
          </div>
          <div className="hifi-knob hifi-knob--large">
            <span>VOLUME</span>
          </div>
        </section>

        <section className="hifi-unit hifi-unit--playlist" aria-label="Playlist do receiver">
          <InteractiveTrackRail
            className="hifi-track-rail"
            contextName={tracklist.contextName}
            currentTrackId={item?.id ?? null}
            isPending={tracklist.isPending}
            isPlayPending={tracklist.isPlayPending}
            onPlayTrack={tracklist.onPlayTrack}
            tracks={tracklist.tracks}
            renderTrack={(track, isCurrent) => (
              <span className="hifi-track" data-current={isCurrent}>
                <span>{String(track.position + 1).padStart(2, '0')}</span>
                <strong>{track.title}</strong>
                {isCurrent && <em>NOW PLAYING</em>}
              </span>
            )}
          />
        </section>

        <ConceptPlaybackHud
          accentColor="#7fffd4"
          controls={controls}
          playback={playback}
          volumeLabel="dB"
        />
      </div>
    </main>
  )
}
