import { Play } from 'lucide-react'

import type { PlaybackState } from '@/features/playback/types/playback-state'
import type { PlaybackControls } from '@/features/themes/core/types/player-theme'
import { getRepeatControlLabel } from '@/features/themes/core/utils/get-repeat-control-label'

import nextIcon from '../assets/next.svg'
import pauseIcon from '../assets/pause.svg'
import previousIcon from '../assets/prev.svg'
import repeatIcon from '../assets/repeat.svg'
import shuffleIcon from '../assets/shuffle.svg'
import { SpotlightIcon } from './spotlight-icon'

interface SpotlightTransportControlsProps {
  controls: PlaybackControls
  playback: PlaybackState | null
}

export function SpotlightTransportControls({
  controls,
  playback
}: SpotlightTransportControlsProps): React.JSX.Element {
  const isPlaying = playback?.isPlaying ?? false
  const canPauseOrResume = isPlaying
    ? playback?.capabilities.canPause
    : playback?.capabilities.canResume
  const isRepeatEnabled = playback ? playback.repeatMode !== 'off' : false

  return (
    <div
      className="flex items-center justify-center gap-[var(--spotlight-transport-gap)]"
      aria-busy={controls.isCommandPending}
    >
      <button
        className="spotlight-control spotlight-control--sm"
        type="button"
        aria-label={playback?.shuffleEnabled ? 'Desativar modo aleatório' : 'Ativar modo aleatório'}
        aria-pressed={playback?.shuffleEnabled ?? false}
        data-active={playback?.shuffleEnabled ?? false}
        data-busy={controls.isPlaybackOptionPending}
        disabled={controls.isPlaybackOptionPending || !playback?.capabilities.canToggleShuffle}
        onClick={controls.onToggleShuffle}
      >
        <SpotlightIcon className="size-full" source={shuffleIcon} />
      </button>

      <div className="flex items-center gap-[var(--spotlight-transport-inner-gap)]">
        <button
          className="spotlight-control spotlight-control--md"
          type="button"
          aria-label="Faixa anterior"
          disabled={controls.isCommandPending || !playback?.capabilities.canSkipPrevious}
          onClick={controls.onPrevious}
        >
          <SpotlightIcon className="size-full" source={previousIcon} />
        </button>

        <button
          className="spotlight-control spotlight-control--lg"
          type="button"
          aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
          disabled={controls.isCommandPending || !canPauseOrResume}
          onClick={controls.onPauseOrResume}
        >
          <span
            className="spotlight-icon-swap size-full"
            data-state={isPlaying ? 'playing' : 'paused'}
          >
            <SpotlightIcon className="size-full" source={pauseIcon} data-icon="pause" />

            <Play
              aria-hidden="true"
              className="size-full translate-x-[2%]"
              data-icon="play"
              fill="currentColor"
              strokeWidth={0}
            />
          </span>
        </button>

        <button
          className="spotlight-control spotlight-control--md"
          type="button"
          aria-label="Próxima faixa"
          disabled={controls.isCommandPending || !playback?.capabilities.canSkipNext}
          onClick={controls.onNext}
        >
          <SpotlightIcon className="size-full" source={nextIcon} />
        </button>
      </div>

      <button
        className="spotlight-control spotlight-control--sm spotlight-control--repeat"
        type="button"
        aria-label={getRepeatControlLabel(playback?.repeatMode ?? 'off')}
        aria-pressed={isRepeatEnabled}
        data-active={isRepeatEnabled}
        data-busy={controls.isPlaybackOptionPending}
        disabled={controls.isPlaybackOptionPending || !playback?.capabilities.canToggleRepeat}
        onClick={controls.onCycleRepeat}
      >
        <span className="spotlight-repeat-clip size-full">
          <SpotlightIcon className="spotlight-repeat-glyph" source={repeatIcon} />
        </span>
      </button>
    </div>
  )
}
