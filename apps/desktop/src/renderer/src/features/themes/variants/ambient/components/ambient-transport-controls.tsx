import { Play } from 'lucide-react'

import type { PlaybackState } from '@/features/playback/types/playback-state'
import type { PlaybackControls } from '@/features/themes/core/types/player-theme'
import { getRepeatControlLabel } from '@/features/themes/core/utils/get-repeat-control-label'

import nextIcon from '../assets/next.svg'
import pauseIcon from '../assets/pause.svg'
import previousIcon from '../assets/prev.svg'
import fullscreenIcon from '../assets/fullscreen.svg'
import repeatIcon from '../assets/repeat.svg'
import savedIcon from '../assets/saved.svg'
import shuffleIcon from '../assets/shuffle.svg'
import { AmbientIcon } from './ambient-icon'

interface AmbientTransportControlsProps {
  controls: PlaybackControls
  isImmersive: boolean
  onToggleImmersive: () => void
  playback: PlaybackState | null
}

export function AmbientTransportControls({
  controls,
  isImmersive,
  onToggleImmersive,
  playback
}: AmbientTransportControlsProps): React.JSX.Element {
  const isPlaying = playback?.isPlaying ?? false
  const canPauseOrResume = isPlaying
    ? playback?.capabilities.canPause
    : playback?.capabilities.canResume
  const isRepeatEnabled = playback ? playback.repeatMode !== 'off' : false

  return (
    <div className="flex items-center gap-[40px]" aria-busy={controls.isCommandPending}>
      <div className="flex w-[80px] items-center justify-between">
        <button
          className="ambient-control ambient-control--saved"
          type="button"
          aria-label={controls.isSaved ? 'Remover da biblioteca' : 'Adicionar à biblioteca'}
          aria-pressed={controls.isSaved}
          data-active={controls.isSaved}
          disabled={!playback?.item || !controls.canToggleSaved || controls.isLibraryPending}
          onClick={controls.onToggleSaved}
        >
          <img alt="" aria-hidden="true" className="size-[24px]" src={savedIcon} />
        </button>
        <button
          className="ambient-control"
          type="button"
          aria-label={
            playback?.shuffleEnabled ? 'Desativar modo aleatório' : 'Ativar modo aleatório'
          }
          aria-pressed={playback?.shuffleEnabled ?? false}
          data-active={playback?.shuffleEnabled ?? false}
          disabled={controls.isPlaybackOptionPending || !playback?.capabilities.canToggleShuffle}
          onClick={controls.onToggleShuffle}
        >
          <AmbientIcon className="size-[24px]" source={shuffleIcon} />
        </button>
      </div>

      <div className="flex items-center gap-[32px]">
        <button
          className="ambient-control"
          type="button"
          aria-label="Faixa anterior"
          disabled={controls.isCommandPending || !playback?.capabilities.canSkipPrevious}
          onClick={controls.onPrevious}
        >
          <AmbientIcon className="size-[24px]" source={previousIcon} />
        </button>

        <button
          className="ambient-play"
          type="button"
          aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
          disabled={controls.isCommandPending || !canPauseOrResume}
          onClick={controls.onPauseOrResume}
        >
          <span className="t-icon-swap size-[24px]" data-state={isPlaying ? 'a' : 'b'}>
            <AmbientIcon className="t-icon size-[24px]" source={pauseIcon} data-icon="a" />
            {/* O Figma entrega apenas o estado tocando, sem glifo de play. */}
            <Play
              aria-hidden="true"
              className="t-icon size-[24px] translate-x-[1px]"
              data-icon="b"
              fill="currentColor"
              strokeWidth={0}
            />
          </span>
        </button>

        <button
          className="ambient-control"
          type="button"
          aria-label="Próxima faixa"
          disabled={controls.isCommandPending || !playback?.capabilities.canSkipNext}
          onClick={controls.onNext}
        >
          <AmbientIcon className="size-[24px]" source={nextIcon} />
        </button>
      </div>

      <div className="flex w-[80px] items-center justify-between">
        <button
          className="ambient-control ambient-control--repeat"
          type="button"
          aria-label={getRepeatControlLabel(playback?.repeatMode ?? 'off')}
          aria-pressed={isRepeatEnabled}
          data-active={isRepeatEnabled}
          disabled={controls.isPlaybackOptionPending || !playback?.capabilities.canToggleRepeat}
          onClick={controls.onCycleRepeat}
        >
          {/* O SVG tem 24x32: o ponto de "repetição ligada" fica abaixo dos
              24px do ícone e só aparece quando o modo está ativo. */}
          <span className="ambient-repeat-clip size-[24px]">
            <AmbientIcon className="ambient-repeat-glyph" source={repeatIcon} />
          </span>
        </button>
        {/* O ícone de tela cheia do Figma alterna o layout reduzido do tema. A
            janela do app em si continua sendo assunto do botão do canto. */}
        <button
          className="ambient-control"
          type="button"
          aria-label={isImmersive ? 'Sair do modo imersivo' : 'Entrar no modo imersivo'}
          aria-pressed={isImmersive}
          data-active={isImmersive}
          title={isImmersive ? 'Sair do modo imersivo' : 'Entrar no modo imersivo'}
          onClick={onToggleImmersive}
        >
          <AmbientIcon className="size-[24px]" source={fullscreenIcon} />
        </button>
      </div>
    </div>
  )
}
