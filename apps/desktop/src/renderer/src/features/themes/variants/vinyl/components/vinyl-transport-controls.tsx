import { Play } from 'lucide-react'

import type { PlaybackState } from '@/features/playback/types/playback-state'
import type { PlaybackControls } from '@/features/themes/core/types/player-theme'
import { getRepeatControlLabel } from '@/features/themes/core/utils/get-repeat-control-label'

import nextIcon from '../assets/next.svg'
import pauseIcon from '../assets/pause.svg'
import previousIcon from '../assets/prev.svg'
import repeatIcon from '../assets/repeat.svg'
import shuffleIcon from '../assets/shuffle.svg'
import { VinylIcon } from './vinyl-icon'

interface VinylTransportControlsProps {
  controls: PlaybackControls
  playback: PlaybackState | null
}

export function VinylTransportControls({
  controls,
  playback
}: VinylTransportControlsProps): React.JSX.Element {
  const isPlaying = playback?.isPlaying ?? false
  const canPauseOrResume = isPlaying
    ? playback?.capabilities.canPause
    : playback?.capabilities.canResume
  const isRepeatEnabled = playback ? playback.repeatMode !== 'off' : false

  return (
    <div className="vinyl-transport" aria-busy={controls.isCommandPending}>
      <button
        className="vinyl-control vinyl-control--sm"
        type="button"
        aria-label={playback?.shuffleEnabled ? 'Desativar modo aleatório' : 'Ativar modo aleatório'}
        aria-pressed={playback?.shuffleEnabled ?? false}
        data-active={playback?.shuffleEnabled ?? false}
        data-busy={controls.isPlaybackOptionPending}
        disabled={controls.isPlaybackOptionPending || !playback?.capabilities.canToggleShuffle}
        onClick={controls.onToggleShuffle}
      >
        <VinylIcon className="size-full" source={shuffleIcon} />
      </button>

      <div className="vinyl-transport-inner">
        <button
          className="vinyl-control"
          type="button"
          aria-label="Faixa anterior"
          disabled={controls.isCommandPending || !playback?.capabilities.canSkipPrevious}
          onClick={controls.onPrevious}
        >
          <VinylIcon className="size-full" source={previousIcon} />
        </button>

        <button
          className="vinyl-control vinyl-control--play"
          type="button"
          aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
          disabled={controls.isCommandPending || !canPauseOrResume}
          onClick={controls.onPauseOrResume}
        >
          <span className="vinyl-icon-swap size-full" data-state={isPlaying ? 'playing' : 'paused'}>
            <VinylIcon className="size-full" source={pauseIcon} data-icon="pause" />

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
          className="vinyl-control"
          type="button"
          aria-label="Próxima faixa"
          disabled={controls.isCommandPending || !playback?.capabilities.canSkipNext}
          onClick={controls.onNext}
        >
          <VinylIcon className="size-full" source={nextIcon} />
        </button>
      </div>

      <button
        className="vinyl-control vinyl-control--sm vinyl-control--repeat"
        type="button"
        aria-label={getRepeatControlLabel(playback?.repeatMode ?? 'off')}
        aria-pressed={isRepeatEnabled}
        data-active={isRepeatEnabled}
        data-busy={controls.isPlaybackOptionPending}
        disabled={controls.isPlaybackOptionPending || !playback?.capabilities.canToggleRepeat}
        onClick={controls.onCycleRepeat}
      >
        <span className="vinyl-repeat-clip size-full">
          <VinylIcon className="vinyl-repeat-glyph" source={repeatIcon} />
        </span>
      </button>
    </div>
  )
}
