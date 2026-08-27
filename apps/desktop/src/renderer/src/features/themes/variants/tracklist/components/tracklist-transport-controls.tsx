import { Pause, Play, Repeat1, Repeat2, Shuffle, SkipBack, SkipForward } from 'lucide-react'

import type { PlaybackState } from '@/features/playback/types/playback-state'
import type { PlaybackControls } from '@/features/themes/core/types/player-theme'
import { getRepeatControlLabel } from '@/features/themes/core/utils/get-repeat-control-label'

interface TracklistTransportControlsProps {
  controls: PlaybackControls
  playback: PlaybackState | null
}

const secondaryButtonClassName =
  'flex h-11 w-11 items-center justify-center rounded-full text-white/68 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#8ee3c2] disabled:cursor-not-allowed disabled:opacity-30'

export function TracklistTransportControls({
  controls,
  playback
}: TracklistTransportControlsProps): React.JSX.Element {
  const canPauseOrResume = playback?.isPlaying
    ? playback.capabilities.canPause
    : playback?.capabilities.canResume

  return (
    <div className="flex items-center justify-center gap-2" aria-busy={controls.isCommandPending}>
      <button
        className={`${secondaryButtonClassName} aria-pressed:text-[#8ee3c2]`}
        type="button"
        aria-label={playback?.shuffleEnabled ? 'Desativar modo aleatório' : 'Ativar modo aleatório'}
        aria-pressed={playback?.shuffleEnabled ?? false}
        disabled={controls.isPlaybackOptionPending || !playback?.capabilities.canToggleShuffle}
        onClick={controls.onToggleShuffle}
      >
        <Shuffle aria-hidden="true" className="h-4.5 w-4.5" />
      </button>
      <button
        className={secondaryButtonClassName}
        type="button"
        aria-label="Faixa anterior"
        disabled={controls.isCommandPending || !playback?.capabilities.canSkipPrevious}
        onClick={controls.onPrevious}
      >
        <SkipBack aria-hidden="true" className="h-5.5 w-5.5" fill="currentColor" />
      </button>
      <button
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e7fff6] text-[#10221b] shadow-[0_12px_32px_rgba(142,227,194,0.18)] transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8ee3c2] disabled:cursor-not-allowed disabled:opacity-30"
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
        className={secondaryButtonClassName}
        type="button"
        aria-label="Próxima faixa"
        disabled={controls.isCommandPending || !playback?.capabilities.canSkipNext}
        onClick={controls.onNext}
      >
        <SkipForward aria-hidden="true" className="h-5.5 w-5.5" fill="currentColor" />
      </button>
      <button
        className={`${secondaryButtonClassName} aria-pressed:text-[#8ee3c2]`}
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
