import { Play } from 'lucide-react'

import type { PlaybackState } from '@/features/playback/types/playback-state'
import type { PlaybackControls } from '@/features/themes/core/types/player-theme'
import { getRepeatControlLabel } from '@/features/themes/core/utils/get-repeat-control-label'

import nextIcon from '../assets/next.svg'
import pauseIcon from '../assets/pause.svg'
import previousIcon from '../assets/prev.svg'
import repeatIcon from '../assets/repeat.svg'
import savedIcon from '../assets/saved.svg'
import shuffleIcon from '../assets/shuffle.svg'
import { PosterIcon } from './poster-icon'

interface PosterTransportControlsProps {
  controls: PlaybackControls
  playback: PlaybackState | null
  volumeControl: React.ReactNode
}

/**
 * A fileira ocupa a largura toda com `justify-between`: favorito na ponta esquerda,
 * o grupo de transporte centrado e o volume na ponta direita, como no Figma. Os
 * botões são os mesmos do tema Ambient, o play incluído — a pílula branca de 56px
 * sobre o glifo de 24px.
 */
export function PosterTransportControls({
  controls,
  playback,
  volumeControl
}: PosterTransportControlsProps): React.JSX.Element {
  const isPlaying = playback?.isPlaying ?? false
  const canPauseOrResume = isPlaying
    ? playback?.capabilities.canPause
    : playback?.capabilities.canResume
  const isRepeatEnabled = playback ? playback.repeatMode !== 'off' : false

  return (
    <div className="flex w-full items-center justify-between" aria-busy={controls.isCommandPending}>
      <button
        className="poster-control poster-control--saved"
        type="button"
        aria-label={controls.isSaved ? 'Remover da biblioteca' : 'Adicionar à biblioteca'}
        aria-pressed={controls.isSaved}
        data-active={controls.isSaved}
        disabled={!playback?.item || !controls.canToggleSaved || controls.isLibraryPending}
        onClick={controls.onToggleSaved}
      >
        <img alt="" aria-hidden="true" className="size-full" src={savedIcon} />
      </button>

      <div className="flex items-center gap-[var(--poster-transport-gap)]">
        <button
          className="poster-control poster-control--sm"
          type="button"
          aria-label={
            playback?.shuffleEnabled ? 'Desativar modo aleatório' : 'Ativar modo aleatório'
          }
          aria-pressed={playback?.shuffleEnabled ?? false}
          data-active={playback?.shuffleEnabled ?? false}
          data-busy={controls.isPlaybackOptionPending}
          disabled={controls.isPlaybackOptionPending || !playback?.capabilities.canToggleShuffle}
          onClick={controls.onToggleShuffle}
        >
          <PosterIcon className="size-full" source={shuffleIcon} />
        </button>

        <div className="flex items-center gap-[var(--poster-transport-inner-gap)]">
          <button
            className="poster-control"
            type="button"
            aria-label="Faixa anterior"
            disabled={controls.isCommandPending || !playback?.capabilities.canSkipPrevious}
            onClick={controls.onPrevious}
          >
            <PosterIcon className="size-full" source={previousIcon} />
          </button>

          <button
            className="poster-play"
            type="button"
            aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
            disabled={controls.isCommandPending || !canPauseOrResume}
            onClick={controls.onPauseOrResume}
          >
            <span className="t-icon-swap poster-play-glyph" data-state={isPlaying ? 'a' : 'b'}>
              <PosterIcon className="t-icon size-full" source={pauseIcon} data-icon="a" />
              {/* O Figma entrega apenas o estado tocando, sem glifo de play. */}
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
            className="poster-control"
            type="button"
            aria-label="Próxima faixa"
            disabled={controls.isCommandPending || !playback?.capabilities.canSkipNext}
            onClick={controls.onNext}
          >
            <PosterIcon className="size-full" source={nextIcon} />
          </button>
        </div>

        <button
          className="poster-control poster-control--sm poster-control--repeat"
          type="button"
          aria-label={getRepeatControlLabel(playback?.repeatMode ?? 'off')}
          aria-pressed={isRepeatEnabled}
          data-active={isRepeatEnabled}
          data-busy={controls.isPlaybackOptionPending}
          disabled={controls.isPlaybackOptionPending || !playback?.capabilities.canToggleRepeat}
          onClick={controls.onCycleRepeat}
        >
          {/* O SVG tem 24x32: o ponto de "repetição ligada" fica abaixo do glifo e
              só escapa do recorte quando o modo está ativo. */}
          <span className="poster-repeat-clip size-full">
            <PosterIcon className="poster-repeat-glyph" source={repeatIcon} />
          </span>
        </button>
      </div>

      {volumeControl}
    </div>
  )
}
