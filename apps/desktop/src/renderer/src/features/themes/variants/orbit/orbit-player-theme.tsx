import { Disc3 } from 'lucide-react'

import { ConceptPlaybackHud } from '@/features/themes/core/components/concept-playback-hud'
import { ConceptThemeChrome } from '@/features/themes/core/components/concept-theme-chrome'
import type { PlayerThemeProps } from '@/features/themes/core/types/player-theme'
import { getPlayerThemeContent } from '@/features/themes/core/utils/get-player-theme-content'
import '@/features/themes/core/components/concept-theme-controls.css'

import { OrbitTrackSelector } from './components/orbit-track-selector'
import './orbit-player-theme.css'

export function OrbitPlayerTheme({
  chrome,
  controls,
  isFullScreen,
  onExitFullScreen,
  playback,
  playbackStatus,
  tracklist
}: PlayerThemeProps): React.JSX.Element {
  const content = getPlayerThemeContent(playback, playbackStatus)

  return (
    <main className="player-theme-root orbit-root">
      <ConceptThemeChrome
        chrome={chrome}
        exitClassName="orbit-fullscreen-button"
        isFullScreen={isFullScreen}
        onExitFullScreen={onExitFullScreen}
      />
      <div aria-hidden="true" className="orbit-stars" />
      <div className="orbit-stage">
        <section className="orbit-system" aria-label="Sistema orbital de faixas">
          {tracklist.isPending ? (
            <div className="orbit-track-state">Mapeando órbita...</div>
          ) : tracklist.tracks.length === 0 ? (
            <div className="orbit-track-state">
              A órbita aparecerá quando um álbum ou playlist estiver tocando.
            </div>
          ) : (
            <OrbitTrackSelector
              currentTrackId={playback?.item?.id ?? null}
              isPlayPending={tracklist.isPlayPending}
              onPlayTrack={tracklist.onPlayTrack}
              tracks={tracklist.tracks}
            />
          )}
          <div className="orbit-core">
            <div className="orbit-cover">
              {content.imageUrl ? (
                <img
                  src={content.imageUrl}
                  alt={`Capa de ${content.collectionName ?? content.title}`}
                />
              ) : (
                <Disc3 aria-hidden="true" />
              )}
            </div>
            <span>NOW ORBITING</span>
            <h1>{content.title}</h1>
            <p>{content.creatorNames}</p>
            {content.collectionName && <small>{content.collectionName}</small>}
          </div>
        </section>
        <ConceptPlaybackHud
          accentColor="#8ae8ff"
          controls={controls}
          playback={playback}
          volumeLabel="SIGNAL"
        />
      </div>
    </main>
  )
}
