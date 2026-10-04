import { Disc3, Pin } from 'lucide-react'

import { ConceptPlaybackHud } from '@/features/themes/core/components/concept-playback-hud'
import { ConceptThemeChrome } from '@/features/themes/core/components/concept-theme-chrome'
import type { PlayerThemeProps } from '@/features/themes/core/types/player-theme'
import { getPlayerThemeContent } from '@/features/themes/core/utils/get-player-theme-content'
import '@/features/themes/core/components/concept-theme-controls.css'

import './setlist-player-theme.css'

export function SetlistPlayerTheme({
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
    <main className="player-theme-root setlist-root">
      <ConceptThemeChrome
        chrome={chrome}
        isFullScreen={isFullScreen}
        onExitFullScreen={onExitFullScreen}
      />
      <div aria-hidden="true" className="setlist-stage-light" />
      <div className="setlist-layout">
        <section className="setlist-paper" aria-label={`Setlist de ${tracklist.contextName}`}>
          <span aria-hidden="true" className="setlist-tape setlist-tape--left" />
          <span aria-hidden="true" className="setlist-tape setlist-tape--right" />
          <header>
            <span>TONIGHT’S SET</span>
            <strong>{tracklist.tracks.length} TRACKS</strong>
          </header>
          <ol>
            {tracklist.isPending ? (
              <li className="setlist-state">Carregando lista de faixas...</li>
            ) : tracklist.tracks.length === 0 ? (
              <li className="setlist-state">
                A lista aparecerá quando um álbum ou playlist estiver tocando.
              </li>
            ) : (
              tracklist.tracks.map((track) => {
                const isCurrent = track.id === item?.id
                return (
                  <li key={`${track.id}:${track.position}`} data-current={isCurrent}>
                    <button
                      type="button"
                      aria-current={isCurrent ? 'true' : undefined}
                      aria-label={`${isCurrent ? 'Tocando agora: ' : 'Reproduzir '}${track.title}`}
                      disabled={isCurrent || !track.isPlayable || tracklist.isPlayPending}
                      onClick={() => tracklist.onPlayTrack(track)}
                    >
                      <span>{String(track.position + 1).padStart(2, '0')}</span>
                      <strong>{track.title}</strong>
                    </button>
                  </li>
                )
              })
            )}
          </ol>
        </section>

        <section className="setlist-now">
          <div className="setlist-polaroid">
            <Pin aria-hidden="true" className="setlist-pin" />
            <div>
              {content.imageUrl ? (
                <img
                  src={content.imageUrl}
                  alt={`Capa de ${content.collectionName ?? content.title}`}
                />
              ) : (
                <Disc3 aria-hidden="true" />
              )}
            </div>
            <small>ON STAGE</small>
          </div>
          <span>NOW PLAYING</span>
          <h1>{content.title}</h1>
          <p>{content.creatorNames}</p>
          {content.collectionName && <small>{content.collectionName}</small>}
        </section>

        <ConceptPlaybackHud
          accentColor="#e84b35"
          controls={controls}
          playback={playback}
          volumeLabel="MONITOR"
        />
      </div>
    </main>
  )
}
