import { Disc3 } from 'lucide-react'

import { ConceptPlaybackHud } from '@/features/themes/core/components/concept-playback-hud'
import { ConceptThemeChrome } from '@/features/themes/core/components/concept-theme-chrome'
import type { PlayerThemeProps } from '@/features/themes/core/types/player-theme'
import { getPlayerThemeContent } from '@/features/themes/core/utils/get-player-theme-content'
import '@/features/themes/core/components/concept-theme-controls.css'

import './prism-player-theme.css'

export function PrismPlayerTheme({
  chrome,
  controls,
  isFullScreen,
  onExitFullScreen,
  playback,
  playbackStatus
}: PlayerThemeProps): React.JSX.Element {
  const content = getPlayerThemeContent(playback, playbackStatus)

  return (
    <main className="player-theme-root prism-root">
      <ConceptThemeChrome
        chrome={chrome}
        exitClassName="prism-fullscreen-button"
        isFullScreen={isFullScreen}
        onExitFullScreen={onExitFullScreen}
      />
      {content.imageUrl && (
        <img aria-hidden="true" className="prism-backdrop" src={content.imageUrl} alt="" />
      )}
      <div aria-hidden="true" className="prism-light prism-light--one" />
      <div aria-hidden="true" className="prism-light prism-light--two" />

      <div className="prism-layout">
        <section className="prism-artwork">
          <div className="prism-cover">
            {content.imageUrl ? (
              <img
                src={content.imageUrl}
                alt={`Capa de ${content.collectionName ?? content.title}`}
              />
            ) : (
              <Disc3 aria-hidden="true" />
            )}
          </div>
          <span aria-hidden="true" className="prism-pane prism-pane--one" />
          <span aria-hidden="true" className="prism-pane prism-pane--two" />
          <span aria-hidden="true" className="prism-pane prism-pane--three" />
        </section>

        <section className="prism-copy">
          <span>REFRACTED SOUND</span>
          <h1>{content.title}</h1>
          <p>{content.creatorNames}</p>
          {content.collectionName && <small>{content.collectionName}</small>}
        </section>

        <ConceptPlaybackHud
          accentColor="#ffffff"
          controls={controls}
          playback={playback}
          secondaryColor="rgba(255, 255, 255, 0.22)"
        />
      </div>
    </main>
  )
}
