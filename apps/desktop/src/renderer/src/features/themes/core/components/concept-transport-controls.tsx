import { Heart, Pause, Play, Repeat1, Repeat2, Shuffle, SkipBack, SkipForward } from 'lucide-react'

import type { PlaybackState } from '@/features/playback/types/playback-state'
import type { PlaybackControls } from '@/features/themes/core/types/player-theme'
import { getRepeatControlLabel } from '@/features/themes/core/utils/get-repeat-control-label'

interface ConceptTransportControlsProps {
  controls: PlaybackControls
  playback: PlaybackState | null
}

export function ConceptTransportControls({
  controls,
  playback
}: ConceptTransportControlsProps): React.JSX.Element {
  const isPlaying = playback?.isPlaying ?? false
  const canPauseOrResume = isPlaying
    ? playback?.capabilities.canPause
    : playback?.capabilities.canResume
  const repeatMode = playback?.repeatMode ?? 'off'

  return (
    <div className="concept-transport" aria-busy={controls.isCommandPending}>
      <button
        className="concept-control concept-control--option"
        type="button"
        aria-label={playback?.shuffleEnabled ? 'Desativar modo aleatório' : 'Ativar modo aleatório'}
        aria-pressed={playback?.shuffleEnabled ?? false}
        data-active={playback?.shuffleEnabled ?? false}
        disabled={controls.isPlaybackOptionPending || !playback?.capabilities.canToggleShuffle}
        onClick={controls.onToggleShuffle}
      >
        <Shuffle aria-hidden="true" />
      </button>
      <button
        className="concept-control"
        type="button"
        aria-label="Faixa anterior"
        disabled={controls.isCommandPending || !playback?.capabilities.canSkipPrevious}
        onClick={controls.onPrevious}
      >
        <SkipBack aria-hidden="true" fill="currentColor" />
      </button>
      <button
        className="concept-control concept-control--play"
        type="button"
        aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
        disabled={controls.isCommandPending || !canPauseOrResume}
        onClick={controls.onPauseOrResume}
      >
        {isPlaying ? (
          <Pause aria-hidden="true" fill="currentColor" />
        ) : (
          <Play aria-hidden="true" className="concept-play-glyph" fill="currentColor" />
        )}
      </button>
      <button
        className="concept-control"
        type="button"
        aria-label="Próxima faixa"
        disabled={controls.isCommandPending || !playback?.capabilities.canSkipNext}
        onClick={controls.onNext}
      >
        <SkipForward aria-hidden="true" fill="currentColor" />
      </button>
      <button
        className="concept-control concept-control--option"
        type="button"
        aria-label={getRepeatControlLabel(repeatMode)}
        aria-pressed={repeatMode !== 'off'}
        data-active={repeatMode !== 'off'}
        disabled={controls.isPlaybackOptionPending || !playback?.capabilities.canToggleRepeat}
        onClick={controls.onCycleRepeat}
      >
        {repeatMode === 'track' ? <Repeat1 aria-hidden="true" /> : <Repeat2 aria-hidden="true" />}
      </button>
      <button
        className="concept-control concept-control--option concept-control--saved"
        type="button"
        aria-label={controls.isSaved ? 'Remover da biblioteca' : 'Adicionar à biblioteca'}
        aria-pressed={controls.isSaved}
        data-active={controls.isSaved}
        disabled={!playback?.item || !controls.canToggleSaved || controls.isLibraryPending}
        onClick={controls.onToggleSaved}
      >
        <Heart aria-hidden="true" fill={controls.isSaved ? 'currentColor' : 'none'} />
      </button>
    </div>
  )
}
