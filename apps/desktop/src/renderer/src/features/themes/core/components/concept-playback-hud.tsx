import { MonitorSpeaker } from 'lucide-react'

import { PlaybackErrorMessage } from '@/features/playback/components/playback-error-message'
import { PlaybackProgressControl } from '@/features/playback/components/playback-progress-control'
import { PlaybackVolumeControl } from '@/features/playback/components/playback-volume-control'
import type { PlaybackState } from '@/features/playback/types/playback-state'
import type { PlaybackControls } from '@/features/themes/core/types/player-theme'

import { ConceptTransportControls } from './concept-transport-controls'

interface ConceptPlaybackHudProps {
  accentColor: string
  controls: PlaybackControls
  playback: PlaybackState | null
  secondaryColor?: string
  volumeLabel?: string
}

export function ConceptPlaybackHud({
  accentColor,
  controls,
  playback,
  secondaryColor = 'rgba(255,255,255,0.14)',
  volumeLabel
}: ConceptPlaybackHudProps): React.JSX.Element {
  const item = playback?.item ?? null

  return (
    <section className="concept-hud" aria-label="Controles da reprodução">
      <PlaybackProgressControl
        accentColor={accentColor}
        canSeek={Boolean(item && playback?.capabilities.canSeek)}
        className="concept-progress"
        durationMs={item?.durationMs ?? 0}
        isPending={controls.isSeekPending}
        onSeek={controls.onSeek}
        positionMs={playback?.progressMs ?? 0}
        rangeClassName="concept-progress-range"
        timeClassName="concept-time-row"
        trackColor={secondaryColor}
      />

      <div className="concept-hud-row">
        <span className="concept-device">
          <MonitorSpeaker aria-hidden="true" />
          {playback?.device.name ?? 'Nenhum dispositivo ativo'}
        </span>

        <ConceptTransportControls controls={controls} playback={playback} />

        <div className="concept-volume-wrap">
          {volumeLabel && <span className="concept-volume-label">{volumeLabel}</span>}
          <PlaybackVolumeControl
            accentColor={accentColor}
            buttonClassName="concept-volume-button"
            canSetVolume={playback?.capabilities.canSetVolume ?? false}
            className="concept-volume"
            isPending={controls.isVolumePending}
            onCommitVolume={controls.onCommitVolume}
            onSetVolume={controls.onSetVolume}
            onToggleMute={controls.onToggleMute}
            percentageClassName="concept-volume-percentage"
            rangeClassName="concept-volume-range"
            trackColor={secondaryColor}
            volumePercent={playback?.device.volumePercent ?? null}
          />
        </div>
      </div>

      {controls.errorMessage && (
        <PlaybackErrorMessage
          key={controls.errorMessage}
          className="concept-error"
          message={controls.errorMessage}
        />
      )}
    </section>
  )
}
