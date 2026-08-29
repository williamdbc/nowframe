import { Heart, Pause, Play, Repeat1, Repeat2, Shuffle, SkipBack, SkipForward } from 'lucide-react'

import type { PlaybackState } from '@/features/playback/types/playback-state'
import type { PlaybackControls } from '@/features/themes/core/types/player-theme'
import { getRepeatControlLabel } from '@/features/themes/core/utils/get-repeat-control-label'

interface CassetteTransportControlsProps {
  controls: PlaybackControls
  playback: PlaybackState | null
}

export function CassetteTransportControls({
  controls,
  playback
}: CassetteTransportControlsProps): React.JSX.Element {
  const isPlaying = playback?.isPlaying ?? false
  const canPauseOrResume = isPlaying
    ? playback?.capabilities.canPause
    : playback?.capabilities.canResume
  const isRepeatEnabled = playback ? playback.repeatMode !== 'off' : false

  return (
    <div className="cassette-transport" aria-busy={controls.isCommandPending}>
      <button
        className="cassette-button cassette-button--secondary"
        type="button"
        aria-label={playback?.shuffleEnabled ? 'Desativar modo aleatório' : 'Ativar modo aleatório'}
        aria-pressed={playback?.shuffleEnabled ?? false}
        data-active={playback?.shuffleEnabled ?? false}
        data-busy={controls.isPlaybackOptionPending}
        disabled={controls.isPlaybackOptionPending || !playback?.capabilities.canToggleShuffle}
        onClick={controls.onToggleShuffle}
      >
        <Shuffle aria-hidden="true" />
      </button>

      <button
        className="cassette-button"
        type="button"
        aria-label="Faixa anterior"
        disabled={controls.isCommandPending || !playback?.capabilities.canSkipPrevious}
        onClick={controls.onPrevious}
      >
        <SkipBack aria-hidden="true" fill="currentColor" />
      </button>

      <button
        className="cassette-button cassette-button--play"
        type="button"
        aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
        disabled={controls.isCommandPending || !canPauseOrResume}
        onClick={controls.onPauseOrResume}
      >
        {isPlaying ? (
          <Pause aria-hidden="true" fill="currentColor" />
        ) : (
          <Play aria-hidden="true" className="cassette-play-glyph" fill="currentColor" />
        )}
      </button>

      <button
        className="cassette-button"
        type="button"
        aria-label="Próxima faixa"
        disabled={controls.isCommandPending || !playback?.capabilities.canSkipNext}
        onClick={controls.onNext}
      >
        <SkipForward aria-hidden="true" fill="currentColor" />
      </button>

      <button
        className="cassette-button cassette-button--secondary"
        type="button"
        aria-label={getRepeatControlLabel(playback?.repeatMode ?? 'off')}
        aria-pressed={isRepeatEnabled}
        data-active={isRepeatEnabled}
        data-busy={controls.isPlaybackOptionPending}
        disabled={controls.isPlaybackOptionPending || !playback?.capabilities.canToggleRepeat}
        onClick={controls.onCycleRepeat}
      >
        {playback?.repeatMode === 'track' ? (
          <Repeat1 aria-hidden="true" />
        ) : (
          <Repeat2 aria-hidden="true" />
        )}
      </button>

      <button
        className="cassette-button cassette-button--secondary cassette-button--saved"
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
