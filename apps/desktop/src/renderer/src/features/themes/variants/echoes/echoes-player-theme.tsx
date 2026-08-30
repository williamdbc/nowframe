import { Disc3 } from 'lucide-react'

import { ConceptPlaybackHud } from '@/features/themes/core/components/concept-playback-hud'
import { ConceptThemeChrome } from '@/features/themes/core/components/concept-theme-chrome'
import type { PlayerThemeProps } from '@/features/themes/core/types/player-theme'
import { getPlayerThemeContent } from '@/features/themes/core/utils/get-player-theme-content'
import '@/features/themes/core/components/concept-theme-controls.css'

import './echoes-player-theme.css'

export function EchoesPlayerTheme({
  chrome,
  controls,
  isFullScreen,
  onExitFullScreen,
  playback,
  playbackStatus
}: PlayerThemeProps): React.JSX.Element {
  const content = getPlayerThemeContent(playback, playbackStatus)
  const playbackClassName = playback?.isPlaying ? ' echoes-root--playing' : ''

  return (
    <main className={`player-theme-root echoes-root${playbackClassName}`}>
      <ConceptThemeChrome
        chrome={chrome}
        exitClassName="echoes-fullscreen-button"
        isFullScreen={isFullScreen}
        onExitFullScreen={onExitFullScreen}
      />
      <div className="echoes-optics" aria-hidden="true">
        <svg viewBox="0 0 1200 620" preserveAspectRatio="none">
          <defs>
            <linearGradient id="echoes-prism-fill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#dfe4e8" stopOpacity="0.04" />
              <stop offset="0.5" stopColor="#9ca6b0" stopOpacity="0.13" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0.025" />
            </linearGradient>
            <linearGradient id="echoes-prism-edge" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="0.48" stopColor="#8d9399" stopOpacity="0.65" />
              <stop offset="1" stopColor="#f7f7f2" stopOpacity="0.92" />
            </linearGradient>
            <filter id="echoes-white-glow" x="-20%" y="-200%" width="140%" height="500%">
              <feGaussianBlur stdDeviation="8" />
            </filter>
            <filter id="echoes-spectrum-glow" x="-20%" y="-120%" width="150%" height="340%">
              <feGaussianBlur stdDeviation="7" />
            </filter>
          </defs>

          <path className="echoes-white-glow" d="M-40 300 L375 300 L657 342" />
          <path className="echoes-white-beam" d="M-40 300 L375 300 L657 342" />

          <g className="echoes-spectrum echoes-spectrum--glow">
            <path d="M657 342 L1240 250" />
            <path d="M657 342 L1240 282" />
            <path d="M657 342 L1240 314" />
            <path d="M657 342 L1240 346" />
            <path d="M657 342 L1240 378" />
            <path d="M657 342 L1240 410" />
          </g>
          <g className="echoes-spectrum">
            <path d="M657 342 L1240 250" />
            <path d="M657 342 L1240 282" />
            <path d="M657 342 L1240 314" />
            <path d="M657 342 L1240 346" />
            <path d="M657 342 L1240 378" />
            <path d="M657 342 L1240 410" />
          </g>

          <path
            className="echoes-prism"
            d="M510 54 L782 528 L238 528 Z"
            fill="url(#echoes-prism-fill)"
            stroke="url(#echoes-prism-edge)"
          />
          <path className="echoes-prism-reflection" d="M510 54 L657 342 L375 300 Z" />
        </svg>
      </div>

      <section className="echoes-track-card">
        <div className="echoes-cover">
          {content.imageUrl ? (
            <img
              src={content.imageUrl}
              alt={`Capa de ${content.collectionName ?? content.title}`}
            />
          ) : (
            <Disc3 aria-hidden="true" />
          )}
        </div>
        <div className="echoes-copy">
          <span>LIGHT / TIME / SOUND</span>
          <h1>{content.title}</h1>
          <p>{content.creatorNames}</p>
          {content.collectionName && <small>{content.collectionName}</small>}
        </div>
      </section>

      <div className="echoes-hud-shell">
        <ConceptPlaybackHud
          accentColor="#f4f4ed"
          controls={controls}
          playback={playback}
          secondaryColor="rgba(255, 255, 255, 0.18)"
        />
      </div>
    </main>
  )
}
