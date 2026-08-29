import { Disc3 } from 'lucide-react'

import { ConceptPlaybackHud } from '@/features/themes/core/components/concept-playback-hud'
import { ConceptThemeChrome } from '@/features/themes/core/components/concept-theme-chrome'
import { InteractiveTrackRail } from '@/features/themes/core/components/interactive-track-rail'
import type { PlayerThemeProps } from '@/features/themes/core/types/player-theme'
import { getPlayerThemeContent } from '@/features/themes/core/utils/get-player-theme-content'
import '@/features/themes/core/components/concept-theme-controls.css'

import './film-strip-player-theme.css'

export function FilmStripPlayerTheme(props: PlayerThemeProps): React.JSX.Element {
  const { chrome, controls, isFullScreen, onExitFullScreen, playback, playbackStatus, tracklist } =
    props
  const content = getPlayerThemeContent(playback, playbackStatus)
  const item = playback?.item ?? null

  return (
    <main className="player-theme-root film-root">
      <ConceptThemeChrome
        chrome={chrome}
        exitClassName="film-fullscreen-button"
        isFullScreen={isFullScreen}
        onExitFullScreen={onExitFullScreen}
      />
      <div aria-hidden="true" className="film-projector-light" />
      <div aria-hidden="true" className="film-grain" />

      <div className="film-stage">
        <section className="film-gate" aria-label="Janela do projetor">
          <span aria-hidden="true" className="film-reel film-reel--left" />
          <span aria-hidden="true" className="film-reel film-reel--right" />
          <div className="film-frame">
            {content.imageUrl ? (
              <img
                src={content.imageUrl}
                alt={`Capa de ${content.collectionName ?? content.title}`}
              />
            ) : (
              <div className="film-cover-placeholder">
                <Disc3 aria-hidden="true" />
                <span className="sr-only">Nenhuma capa de álbum disponível</span>
              </div>
            )}
          </div>
          <div className="film-copy">
            <span>FRAME {String((item?.id?.length ?? 0) + 1).padStart(2, '0')}</span>
            <h1>{content.title}</h1>
            <p>{content.creatorNames}</p>
            {content.collectionName && <small>{content.collectionName}</small>}
          </div>
        </section>

        <InteractiveTrackRail
          className="film-strip"
          contextName={tracklist.contextName}
          currentTrackId={item?.id ?? null}
          isPending={tracklist.isPending}
          isPlayPending={tracklist.isPlayPending}
          onPlayTrack={tracklist.onPlayTrack}
          tracks={tracklist.tracks}
          renderTrack={(track, isCurrent) => (
            <span className="film-cell" data-current={isCurrent}>
              <span className="film-sprockets film-sprockets--top" aria-hidden="true" />
              <span className="film-cell-image">
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
              <span className="film-cell-label">
                {track.position + 1}. {track.title}
              </span>
              <span className="film-sprockets film-sprockets--bottom" aria-hidden="true" />
            </span>
          )}
        />

        <ConceptPlaybackHud accentColor="#f2c14e" controls={controls} playback={playback} />
      </div>
    </main>
  )
}
