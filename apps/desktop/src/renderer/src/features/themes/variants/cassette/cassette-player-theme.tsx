import { MonitorSpeaker } from 'lucide-react'

import { PlaybackErrorMessage } from '@/features/playback/components/playback-error-message'
import { PlaybackProgressControl } from '@/features/playback/components/playback-progress-control'
import { PlaybackVolumeControl } from '@/features/playback/components/playback-volume-control'
import type { PlayerThemeProps } from '@/features/themes/core/types/player-theme'
import { getPlayerThemeContent } from '@/features/themes/core/utils/get-player-theme-content'
import { FullscreenExitControl } from '@/features/window-controls/components/fullscreen-exit-control'

import { CassetteDeck } from './components/cassette-deck'
import { CassetteTransportControls } from './components/cassette-transport-controls'
import './cassette-player-theme.css'

export function CassettePlayerTheme({
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
    <main className="player-theme-root cassette-root">
      <div className="player-theme-chrome fixed top-6 left-6 z-30">{chrome.connectionStatus}</div>
      <nav
        className="player-theme-chrome fixed top-6 right-6 z-30 flex items-start gap-2"
        aria-label="Ações do display"
      >
        {chrome.themeSelector}
        {chrome.accountMenu}
        {isFullScreen ? (
          <FullscreenExitControl
            className="cassette-fullscreen-button"
            onExitFullScreen={onExitFullScreen}
          />
        ) : (
          chrome.fullscreenControl
        )}
      </nav>

      <div className="cassette-layout">
        <CassetteDeck
          collectionName={content.collectionName}
          creatorNames={content.creatorNames}
          imageUrl={content.imageUrl}
          title={content.title}
        />

        <section className="cassette-control-panel" aria-label="Controles da reprodução">
          <div className="cassette-device-row">
            <MonitorSpeaker aria-hidden="true" />
            <span>{playback?.device.name ?? 'Nenhum dispositivo ativo'}</span>
          </div>

          <PlaybackProgressControl
            accentColor="#ef4b23"
            canSeek={Boolean(item && playback?.capabilities.canSeek)}
            className="cassette-progress"
            durationMs={item?.durationMs ?? 0}
            isPending={controls.isSeekPending}
            onSeek={controls.onSeek}
            positionMs={playback?.progressMs ?? 0}
            rangeClassName="cassette-progress-range"
            timeClassName="cassette-time-row"
            trackColor="rgba(35, 27, 22, 0.14)"
          />

          <CassetteTransportControls controls={controls} playback={playback} />

          <PlaybackVolumeControl
            accentColor="#27201b"
            buttonClassName="cassette-volume-button"
            canSetVolume={playback?.capabilities.canSetVolume ?? false}
            className="cassette-volume"
            isPending={controls.isVolumePending}
            onCommitVolume={controls.onCommitVolume}
            onSetVolume={controls.onSetVolume}
            onToggleMute={controls.onToggleMute}
            percentageClassName="cassette-volume-percentage"
            rangeClassName="cassette-volume-range"
            trackColor="rgba(35, 27, 22, 0.14)"
            volumePercent={playback?.device.volumePercent ?? null}
          />

          {controls.errorMessage && (
            <PlaybackErrorMessage
              key={controls.errorMessage}
              className="cassette-error"
              message={controls.errorMessage}
            />
          )}
        </section>
      </div>
    </main>
  )
}
