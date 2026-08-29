import { Disc3, MonitorSpeaker } from 'lucide-react'

import { PlaybackErrorMessage } from '@/features/playback/components/playback-error-message'
import { PlaybackProgressControl } from '@/features/playback/components/playback-progress-control'
import { PlaybackVolumeControl } from '@/features/playback/components/playback-volume-control'
import type { PlayerThemeProps } from '@/features/themes/core/types/player-theme'
import { getPlayerThemeContent } from '@/features/themes/core/utils/get-player-theme-content'
import { FullscreenExitControl } from '@/features/window-controls/components/fullscreen-exit-control'

import { RocketLeagueTransportControls } from './components/rocket-league-transport-controls'
import './rocket-league-player-theme.css'

export function RocketLeaguePlayerTheme({
  chrome,
  controls,
  isFullScreen,
  onExitFullScreen,
  playback,
  playbackStatus
}: PlayerThemeProps): React.JSX.Element {
  const content = getPlayerThemeContent(playback, playbackStatus)
  const item = playback?.item ?? null

  return (
    <main className="player-theme-root rocket-root">
      <div aria-hidden="true" className="rocket-sky" />
      <div aria-hidden="true" className="rocket-hex-grid" />
      <div aria-hidden="true" className="rocket-floodlight rocket-floodlight--blue" />
      <div aria-hidden="true" className="rocket-floodlight rocket-floodlight--orange" />
      <div aria-hidden="true" className="rocket-crowd" />
      <div aria-hidden="true" className="rocket-pitch">
        <span className="rocket-pitch-line rocket-pitch-line--center" />
        <span className="rocket-pitch-circle" />
        <span className="rocket-goal rocket-goal--blue" />
        <span className="rocket-goal rocket-goal--orange" />
      </div>

      <div className="player-theme-chrome fixed top-6 left-6 z-30">{chrome.connectionStatus}</div>
      <nav
        className="player-theme-chrome fixed top-6 right-6 z-30 flex items-start gap-2"
        aria-label="Ações do display"
      >
        {chrome.themeSelector}
        {chrome.accountMenu}
        {isFullScreen ? (
          <FullscreenExitControl
            className="rocket-fullscreen-button"
            onExitFullScreen={onExitFullScreen}
          />
        ) : (
          chrome.fullscreenControl
        )}
      </nav>

      <div className="rocket-stage">
        <section className="rocket-scoreboard" aria-label="Placar da arena">
          <div className="rocket-scoreboard-side rocket-scoreboard-side--blue">
            <span>BLUE</span>
          </div>
          <div className="rocket-scoreboard-track">
            <span className="rocket-live-label">NOW PLAYING</span>
            <h1>{content.title}</h1>
          </div>
          <div className="rocket-scoreboard-side rocket-scoreboard-side--orange">
            <span>ORANGE</span>
          </div>
        </section>

        <section className="rocket-match" aria-label="Arena musical">
          <aside className="rocket-player-card rocket-player-card--blue">
            <span>ARTIST</span>
            <strong>{content.creatorNames}</strong>
          </aside>

          <figure className="rocket-jumbotron">
            <div className="rocket-jumbotron-beam" aria-hidden="true" />
            <div className="rocket-cover-frame">
              <span aria-hidden="true" className="rocket-frame-corner rocket-frame-corner--one" />
              <span aria-hidden="true" className="rocket-frame-corner rocket-frame-corner--two" />
              {content.imageUrl ? (
                <img
                  key={content.imageUrl}
                  src={content.imageUrl}
                  alt={`Capa de ${content.collectionName ?? content.title}`}
                  className="rocket-cover"
                />
              ) : (
                <div className="rocket-cover-placeholder">
                  <Disc3 aria-hidden="true" />
                  <span className="sr-only">Nenhuma capa de álbum disponível</span>
                </div>
              )}
            </div>
            <figcaption>LIVE AUDIO FEED</figcaption>
          </figure>

          <aside className="rocket-player-card rocket-player-card--orange">
            <span>ALBUM</span>
            <strong>{content.collectionName ?? 'SEM CONTEXTO'}</strong>
          </aside>
        </section>

        <section className="rocket-hud" aria-label="Controles da partida">
          <PlaybackProgressControl
            accentColor="#1688f8"
            canSeek={Boolean(item && playback?.capabilities.canSeek)}
            className="rocket-progress"
            durationMs={item?.durationMs ?? 0}
            isPending={controls.isSeekPending}
            onSeek={controls.onSeek}
            positionMs={playback?.progressMs ?? 0}
            rangeClassName="rocket-progress-range"
            timeClassName="rocket-time-row"
            trackColor="#f58220"
          />

          <div className="rocket-hud-bottom">
            <div className="rocket-device">
              <MonitorSpeaker aria-hidden="true" />
              <span>{playback?.device.name ?? 'Nenhum dispositivo ativo'}</span>
            </div>

            <RocketLeagueTransportControls controls={controls} playback={playback} />

            <div className="rocket-boost">
              <span className="rocket-boost-label">BOOST</span>
              <PlaybackVolumeControl
                accentColor="#ff9f1a"
                buttonClassName="rocket-volume-button"
                canSetVolume={playback?.capabilities.canSetVolume ?? false}
                className="rocket-volume"
                isPending={controls.isVolumePending}
                onCommitVolume={controls.onCommitVolume}
                onSetVolume={controls.onSetVolume}
                onToggleMute={controls.onToggleMute}
                percentageClassName="rocket-volume-percentage"
                rangeClassName="rocket-volume-range"
                trackColor="rgba(255,255,255,0.12)"
                volumePercent={playback?.device.volumePercent ?? null}
              />
            </div>
          </div>

          {controls.errorMessage && (
            <PlaybackErrorMessage
              key={controls.errorMessage}
              className="rocket-error"
              message={controls.errorMessage}
            />
          )}
        </section>
      </div>
    </main>
  )
}
