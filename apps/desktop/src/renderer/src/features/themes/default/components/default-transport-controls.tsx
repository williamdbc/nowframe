import { Pause, Play, SkipBack, SkipForward } from 'lucide-react'

import type { PlaybackState } from '@/features/playback/types/playback-state'
import type { PlaybackControls } from '@/features/themes/types/player-theme'

interface DefaultTransportControlsProps {
  controls: PlaybackControls
  playback: PlaybackState | null
}

export function DefaultTransportControls({
  controls,
  playback
}: DefaultTransportControlsProps): React.JSX.Element {
  const canPauseOrResume = playback?.isPlaying
    ? playback.capabilities.canPause
    : playback?.capabilities.canResume

  return (
    <div className="mt-10 flex items-center gap-7" aria-busy={controls.isCommandPending}>
      <button
        className="player-control"
        type="button"
        aria-label="Faixa anterior"
        disabled={controls.isCommandPending || !playback?.capabilities.canSkipPrevious}
        onClick={controls.onPrevious}
      >
        <SkipBack aria-hidden="true" className="h-8 w-8" fill="currentColor" />
      </button>
      <button
        className="player-control player-control-primary"
        type="button"
        aria-label={playback?.isPlaying ? 'Pausar' : 'Reproduzir'}
        disabled={controls.isCommandPending || !canPauseOrResume}
        onClick={controls.onPauseOrResume}
      >
        {playback?.isPlaying ? (
          <Pause aria-hidden="true" className="h-9 w-9" fill="currentColor" />
        ) : (
          <Play aria-hidden="true" className="ml-1 h-9 w-9" fill="currentColor" />
        )}
      </button>
      <button
        className="player-control"
        type="button"
        aria-label="Próxima faixa"
        disabled={controls.isCommandPending || !playback?.capabilities.canSkipNext}
        onClick={controls.onNext}
      >
        <SkipForward aria-hidden="true" className="h-8 w-8" fill="currentColor" />
      </button>
    </div>
  )
}
