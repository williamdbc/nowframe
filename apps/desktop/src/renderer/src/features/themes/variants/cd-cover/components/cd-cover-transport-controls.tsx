import { Play } from 'lucide-react'

import type { PlaybackState } from '@/features/playback/types/playback-state'
import type { PlaybackControls } from '@/features/themes/core/types/player-theme'
import { getRepeatControlLabel } from '@/features/themes/core/utils/get-repeat-control-label'

import nextIcon from '../assets/next.svg'
import pauseIcon from '../assets/pause.svg'
import previousIcon from '../assets/prev.svg'
import repeatIcon from '../assets/repeat.svg'
import shuffleIcon from '../assets/shuffle.svg'
import { CdCoverIcon } from './cd-cover-icon'

interface CdCoverTransportControlsProps {
  controls: PlaybackControls
  playback: PlaybackState | null
}

export function CdCoverTransportControls({
  controls,
  playback
}: CdCoverTransportControlsProps): React.JSX.Element {
  const isPlaying = playback?.isPlaying ?? false
  const canPauseOrResume = isPlaying
    ? playback?.capabilities.canPause
    : playback?.capabilities.canResume
  const isRepeatEnabled = playback ? playback.repeatMode !== 'off' : false

  return (
    <div
      className="flex items-center justify-center gap-[var(--cd-transport-gap)]"
      aria-busy={controls.isCommandPending}
    >
      <button
        className="cd-cover-control cd-cover-control--sm"
        type="button"
        aria-label={playback?.shuffleEnabled ? 'Desativar modo aleatório' : 'Ativar modo aleatório'}
        aria-pressed={playback?.shuffleEnabled ?? false}
        data-active={playback?.shuffleEnabled ?? false}
        data-busy={controls.isPlaybackOptionPending}
        disabled={controls.isPlaybackOptionPending || !playback?.capabilities.canToggleShuffle}
        onClick={controls.onToggleShuffle}
      >
        <CdCoverIcon className="size-full" source={shuffleIcon} />
      </button>

      <div className="flex items-center gap-[var(--cd-transport-inner-gap)]">
        <button
          className="cd-cover-control"
          type="button"
          aria-label="Faixa anterior"
          disabled={controls.isCommandPending || !playback?.capabilities.canSkipPrevious}
          onClick={controls.onPrevious}
        >
          <CdCoverIcon className="size-full" source={previousIcon} />
        </button>

        <button
          className="cd-cover-play"
          type="button"
          aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
          disabled={controls.isCommandPending || !canPauseOrResume}
          onClick={controls.onPauseOrResume}
        >
          <span className="t-icon-swap cd-cover-play-glyph" data-state={isPlaying ? 'a' : 'b'}>
            <CdCoverIcon className="t-icon size-full" source={pauseIcon} data-icon="a" />

            <Play
              aria-hidden="true"
              className="t-icon size-full translate-x-[1px]"
              data-icon="b"
              fill="currentColor"
              strokeWidth={0}
            />
          </span>
        </button>

        <button
          className="cd-cover-control"
          type="button"
          aria-label="Próxima faixa"
          disabled={controls.isCommandPending || !playback?.capabilities.canSkipNext}
          onClick={controls.onNext}
        >
          <CdCoverIcon className="size-full" source={nextIcon} />
        </button>
      </div>

      <button
        className="cd-cover-control cd-cover-control--sm cd-cover-control--repeat"
        type="button"
        aria-label={getRepeatControlLabel(playback?.repeatMode ?? 'off')}
        aria-pressed={isRepeatEnabled}
        data-active={isRepeatEnabled}
        data-busy={controls.isPlaybackOptionPending}
        disabled={controls.isPlaybackOptionPending || !playback?.capabilities.canToggleRepeat}
        onClick={controls.onCycleRepeat}
      >
        <span className="cd-cover-repeat-clip size-full">
          <CdCoverIcon className="cd-cover-repeat-glyph" source={repeatIcon} />
        </span>
      </button>
    </div>
  )
}
