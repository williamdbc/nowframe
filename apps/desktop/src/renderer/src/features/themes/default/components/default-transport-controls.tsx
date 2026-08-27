import { Pause, Play, Repeat1, Repeat2, Shuffle, SkipBack, SkipForward } from 'lucide-react'

import type { PlaybackState } from '@/features/playback/types/playback-state'
import type { PlaybackControls } from '@/features/themes/types/player-theme'
import { getRepeatControlLabel } from '@/features/themes/utils/get-repeat-control-label'

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
    <div
      className="default-transport-controls flex items-center gap-4 max-[1100px]:gap-2"
      aria-busy={controls.isCommandPending}
    >
      <button
        className="player-control aria-pressed:text-[#1ed760]"
        type="button"
        aria-label={playback?.shuffleEnabled ? 'Desativar modo aleatório' : 'Ativar modo aleatório'}
        aria-pressed={playback?.shuffleEnabled ?? false}
        disabled={controls.isPlaybackOptionPending || !playback?.capabilities.canToggleShuffle}
        onClick={controls.onToggleShuffle}
      >
        <Shuffle aria-hidden="true" className="h-6 w-6" />
      </button>
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
      <button
        className="player-control aria-pressed:text-[#1ed760]"
        type="button"
        aria-label={getRepeatControlLabel(playback?.repeatMode ?? 'off')}
        aria-pressed={playback?.repeatMode !== 'off'}
        disabled={controls.isPlaybackOptionPending || !playback?.capabilities.canToggleRepeat}
        onClick={controls.onCycleRepeat}
      >
        {playback?.repeatMode === 'track' ? (
          <Repeat1 aria-hidden="true" className="h-6 w-6" />
        ) : (
          <Repeat2 aria-hidden="true" className="h-6 w-6" />
        )}
      </button>
    </div>
  )
}
