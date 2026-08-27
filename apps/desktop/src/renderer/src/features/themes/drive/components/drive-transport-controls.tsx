import { Pause, Play, SkipBack, SkipForward } from 'lucide-react'

import type { PlaybackState } from '@/features/playback/types/playback-state'
import type { PlaybackControls } from '@/features/themes/types/player-theme'

interface DriveTransportControlsProps {
  controls: PlaybackControls
  playback: PlaybackState | null
}

const secondaryButtonClassName =
  'flex h-20 w-full items-center justify-center rounded-[1.35rem] border border-white/10 bg-white/[0.07] text-white/76 transition hover:bg-white/[0.12] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#66e4ff] disabled:cursor-not-allowed disabled:opacity-30'

export function DriveTransportControls({
  controls,
  playback
}: DriveTransportControlsProps): React.JSX.Element {
  const canPauseOrResume = playback?.isPlaying
    ? playback.capabilities.canPause
    : playback?.capabilities.canResume

  return (
    <div
      className="grid grid-cols-[1fr_1.3fr_1fr] items-center gap-3"
      aria-busy={controls.isCommandPending}
    >
      <button
        className={secondaryButtonClassName}
        type="button"
        aria-label="Faixa anterior"
        disabled={controls.isCommandPending || !playback?.capabilities.canSkipPrevious}
        onClick={controls.onPrevious}
      >
        <SkipBack aria-hidden="true" className="h-9 w-9" fill="currentColor" />
      </button>
      <button
        className="flex h-24 w-full items-center justify-center rounded-[1.5rem] bg-[#66e4ff] text-[#071014] shadow-[0_16px_50px_rgba(102,228,255,0.24)] transition hover:bg-[#8aecff] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-35"
        type="button"
        aria-label={playback?.isPlaying ? 'Pausar' : 'Reproduzir'}
        disabled={controls.isCommandPending || !canPauseOrResume}
        onClick={controls.onPauseOrResume}
      >
        {playback?.isPlaying ? (
          <Pause aria-hidden="true" className="h-11 w-11" fill="currentColor" />
        ) : (
          <Play aria-hidden="true" className="ml-1 h-11 w-11" fill="currentColor" />
        )}
      </button>
      <button
        className={secondaryButtonClassName}
        type="button"
        aria-label="Próxima faixa"
        disabled={controls.isCommandPending || !playback?.capabilities.canSkipNext}
        onClick={controls.onNext}
      >
        <SkipForward aria-hidden="true" className="h-9 w-9" fill="currentColor" />
      </button>
    </div>
  )
}
