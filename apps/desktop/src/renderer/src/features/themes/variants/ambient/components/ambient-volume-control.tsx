import { useRef, useState } from 'react'

import volumeIcon from '../assets/volume.svg'
import { AmbientIcon } from './ambient-icon'

interface AmbientVolumeControlProps {
  canSetVolume: boolean
  isPending: boolean
  onCommitVolume: (volumePercent: number) => Promise<void>
  onSetVolume: (volumePercent: number) => void
  onToggleMute: () => void
  orientation: 'horizontal' | 'vertical'
  volumePercent: number | null
}

const rangeCommitKeys = new Set([
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'End',
  'Home',
  'PageDown',
  'PageUp'
])

/**
 * O controle compartilhado é sempre horizontal e mostra a porcentagem; o Figma
 * pede uma coluna ao lado da capa na janela e uma faixa com thumb no modo tela
 * cheia. O input continua sendo um range nativo — transparente sobre a trilha
 * pintada — para preservar teclado e leitor de tela.
 */
export function AmbientVolumeControl({
  canSetVolume,
  isPending,
  onCommitVolume,
  onSetVolume,
  onToggleMute,
  orientation,
  volumePercent
}: AmbientVolumeControlProps): React.JSX.Element {
  const [previewVolumePercent, setPreviewVolumePercent] = useState<number | null>(null)
  const committedVolumePercent = useRef<number | null>(null)
  const displayedVolumePercent = previewVolumePercent ?? volumePercent ?? 0
  const isMuted = volumePercent === 0
  const isDisabled = !canSetVolume || volumePercent === null
  const isVertical = orientation === 'vertical'

  const commitVolume = (nextVolumePercent: number): void => {
    const roundedVolumePercent = Math.round(nextVolumePercent)
    if (committedVolumePercent.current === roundedVolumePercent) return

    committedVolumePercent.current = roundedVolumePercent
    void onCommitVolume(roundedVolumePercent).then(() => {
      if (committedVolumePercent.current !== roundedVolumePercent) return

      committedVolumePercent.current = null
      setPreviewVolumePercent(null)
    })
  }

  const range = (
    <input
      className={isVertical ? 'ambient-volume-range' : 'ambient-volume-range-horizontal'}
      type="range"
      min={0}
      max={100}
      step={1}
      value={displayedVolumePercent}
      aria-label="Volume"
      aria-valuetext={`${displayedVolumePercent}%`}
      disabled={isDisabled}
      onBlur={(event) => {
        if (previewVolumePercent !== null) commitVolume(Number(event.currentTarget.value))
      }}
      onChange={(event) => {
        const nextVolumePercent = Number(event.currentTarget.value)
        committedVolumePercent.current = null
        setPreviewVolumePercent(nextVolumePercent)
        onSetVolume(nextVolumePercent)
      }}
      onKeyUp={(event) => {
        if (rangeCommitKeys.has(event.key)) commitVolume(Number(event.currentTarget.value))
      }}
      onPointerUp={(event) => commitVolume(Number(event.currentTarget.value))}
    />
  )

  const muteButton = (
    <button
      className="ambient-mute"
      type="button"
      aria-label={isMuted ? 'Restaurar volume' : 'Silenciar'}
      data-muted={isMuted}
      disabled={isDisabled}
      onClick={onToggleMute}
    >
      <AmbientIcon className="size-[16px]" source={volumeIcon} />
    </button>
  )

  if (!isVertical) {
    return (
      <div className="flex w-full items-center gap-[8px]" aria-busy={isPending}>
        {muteButton}
        <div className="ambient-volume-track relative h-[6px] min-w-px flex-1 rounded-[999px] bg-white/12">
          <div
            className="ambient-volume-fill absolute top-0 left-0 h-[6px] rounded-[999px] bg-white opacity-90"
            style={{ width: `${displayedVolumePercent}%` }}
          />
          <span
            aria-hidden="true"
            className="ambient-volume-thumb"
            style={{ left: `${displayedVolumePercent}%` }}
          />
          {range}
        </div>
      </div>
    )
  }

  return (
    <div className="ambient-volume-column" aria-busy={isPending}>
      <div className="ambient-volume-track relative w-[16px] flex-1 overflow-clip rounded-[999px] bg-white/12">
        <div
          className="ambient-volume-fill absolute bottom-0 left-0 w-[16px] rounded-[999px] bg-white"
          style={{ height: `${displayedVolumePercent}%` }}
        />
        {range}
      </div>
      {muteButton}
    </div>
  )
}
