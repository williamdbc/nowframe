import { Disc3 } from 'lucide-react'

import { ConceptPlaybackHud } from '@/features/themes/core/components/concept-playback-hud'
import { ConceptThemeChrome } from '@/features/themes/core/components/concept-theme-chrome'
import { InteractiveTrackRail } from '@/features/themes/core/components/interactive-track-rail'
import type { PlayerThemeProps } from '@/features/themes/core/types/player-theme'
import { getPlayerThemeContent } from '@/features/themes/core/utils/get-player-theme-content'
import '@/features/themes/core/components/concept-theme-controls.css'

import './minidisc-deck-player-theme.css'

export function MiniDiscDeckPlayerTheme({
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
    <main className="player-theme-root md-root">
      <ConceptThemeChrome
        chrome={chrome}
        exitClassName="md-fullscreen-button"
        isFullScreen={isFullScreen}
        onExitFullScreen={onExitFullScreen}
      />
      <div className="md-deck">
        <div aria-hidden="true" className="md-screw md-screw--one" />
        <div aria-hidden="true" className="md-screw md-screw--two" />
        <div aria-hidden="true" className="md-screw md-screw--three" />
        <div aria-hidden="true" className="md-screw md-screw--four" />
        <section className="md-disc-bay" aria-label="MiniDisc em reprodução">
          <div className="md-cartridge">
            <span className="md-cartridge-label">MD • 74</span>
            <div className="md-shutter">
              <div className="md-disc">
                {content.imageUrl ? (
                  <img
                    src={content.imageUrl}
                    alt={`Capa de ${content.collectionName ?? content.title}`}
                  />
                ) : (
                  <Disc3 aria-hidden="true" />
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="md-display" aria-label="Display do MiniDisc">
          <div className="md-display-top">
            <span>
              TRACK{' '}
              {String(
                tracklist.tracks.findIndex((track) => track.id === item?.id) + 1 || 1
              ).padStart(2, '0')}
            </span>
            <span>STEREO</span>
            <span>48kHz</span>
          </div>
          <h1>{content.title}</h1>
          <p>{content.creatorNames}</p>
          {content.collectionName && <small>{content.collectionName}</small>}
          <div className="md-vu" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        </section>

        <section className="md-track-window" aria-label="Lista no display LCD">
          <InteractiveTrackRail
            className="md-track-rail"
            contextName={tracklist.contextName}
            currentTrackId={item?.id ?? null}
            isPending={tracklist.isPending}
            isPlayPending={tracklist.isPlayPending}
            onPlayTrack={tracklist.onPlayTrack}
            tracks={tracklist.tracks}
            renderTrack={(track, isCurrent) => (
              <span className="md-track" data-current={isCurrent}>
                <span>{String(track.position + 1).padStart(2, '0')}</span>
                <strong>{track.title}</strong>
              </span>
            )}
          />
        </section>

        <ConceptPlaybackHud
          accentColor="#ffae35"
          controls={controls}
          playback={playback}
          volumeLabel="OUTPUT"
        />
      </div>
    </main>
  )
}
