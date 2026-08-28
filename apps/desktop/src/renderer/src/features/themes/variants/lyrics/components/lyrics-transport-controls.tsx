import { Pause, Play, Repeat1, Repeat2, Shuffle, SkipBack, SkipForward } from 'lucide-react'

import type { PlaybackState } from '@/features/playback/types/playback-state'
import type { PlaybackControls } from '@/features/themes/core/types/player-theme'
import { getRepeatControlLabel } from '@/features/themes/core/utils/get-repeat-control-label'

interface LyricsTransportControlsProps {
  controls: PlaybackControls
  playback: PlaybackState | null
}

export function LyricsTransportControls({
  controls,
  playback
}: LyricsTransportControlsProps): React.JSX.Element {
  const canPauseOrResume = playback?.isPlaying
    ? playback.capabilities.canPause
    : playback?.capabilities.canResume

  return (
    <div
      className="lyrics-transport-controls flex items-center justify-center gap-2"
      aria-busy={controls.isCommandPending}
    >
      <button
        className="lyrics-control"
        type="button"
        aria-label={playback?.shuffleEnabled ? 'Desativar modo aleatório' : 'Ativar modo aleatório'}
        aria-pressed={playback?.shuffleEnabled ?? false}
        disabled={controls.isPlaybackOptionPending || !playback?.capabilities.canToggleShuffle}
        onClick={controls.onToggleShuffle}
      >
        <Shuffle aria-hidden="true" className="h-4.5 w-4.5" />
      </button>
      <button
        className="lyrics-control"
        type="button"
        aria-label="Faixa anterior"
        disabled={controls.isCommandPending || !playback?.capabilities.canSkipPrevious}
        onClick={controls.onPrevious}
      >
        <SkipBack aria-hidden="true" className="h-5.5 w-5.5" fill="currentColor" />
      </button>
      <button
        className="lyrics-control lyrics-control-primary"
        type="button"
        aria-label={playback?.isPlaying ? 'Pausar' : 'Reproduzir'}
        disabled={controls.isCommandPending || !canPauseOrResume}
        onClick={controls.onPauseOrResume}
      >
        {playback?.isPlaying ? (
          <Pause aria-hidden="true" className="h-6 w-6" fill="currentColor" />
        ) : (
          <Play aria-hidden="true" className="ml-0.5 h-6 w-6" fill="currentColor" />
        )}
      </button>
      <button
        className="lyrics-control"
        type="button"
        aria-label="Próxima faixa"
        disabled={controls.isCommandPending || !playback?.capabilities.canSkipNext}
        onClick={controls.onNext}
      >
        <SkipForward aria-hidden="true" className="h-5.5 w-5.5" fill="currentColor" />
      </button>
      <button
        className="lyrics-control"
        type="button"
        aria-label={getRepeatControlLabel(playback?.repeatMode ?? 'off')}
        aria-pressed={playback?.repeatMode !== 'off'}
        disabled={controls.isPlaybackOptionPending || !playback?.capabilities.canToggleRepeat}
        onClick={controls.onCycleRepeat}
      >
        {playback?.repeatMode === 'track' ? (
          <Repeat1 aria-hidden="true" className="h-4.5 w-4.5" />
        ) : (
          <Repeat2 aria-hidden="true" className="h-4.5 w-4.5" />
        )}
      </button>
    </div>
  )
}
