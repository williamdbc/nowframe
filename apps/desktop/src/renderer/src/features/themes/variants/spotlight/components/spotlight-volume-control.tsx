import { useRef, useState } from 'react'

import volumeIcon from '../assets/volume.svg'
import { SpotlightIcon } from './spotlight-icon'

interface SpotlightVolumeControlProps {
  canSetVolume: boolean
  isPending: boolean
  onCommitVolume: (volumePercent: number) => Promise<void>
  onSetVolume: (volumePercent: number) => void
  onToggleMute: () => void
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

export function SpotlightVolumeControl({
  canSetVolume,
  isPending,
  onCommitVolume,
  onSetVolume,
  onToggleMute,
  volumePercent
}: SpotlightVolumeControlProps): React.JSX.Element {
  const [previewVolumePercent, setPreviewVolumePercent] = useState<number | null>(null)
  const committedVolumePercent = useRef<number | null>(null)
  const displayedVolumePercent = previewVolumePercent ?? volumePercent ?? 0
  const isMuted = volumePercent === 0
  const isDisabled = !canSetVolume || volumePercent === null

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

  return (
    <div className="flex w-full items-center gap-[16px]" aria-busy={isPending}>
      <button
        className="spotlight-mute shrink-0"
        type="button"
        aria-label={isMuted ? 'Restaurar volume' : 'Silenciar'}
        data-muted={isMuted}
        disabled={isDisabled}
        onClick={onToggleMute}
      >
        <SpotlightIcon className="size-[16px]" source={volumeIcon} />
      </button>

      <div className="spotlight-volume-track relative h-[4px] min-w-px flex-1 rounded-[999px] bg-white/12">
        <div
          className="spotlight-volume-fill absolute top-0 left-0 h-[4px] rounded-[999px] bg-white opacity-90"
          style={{ width: `${displayedVolumePercent}%` }}
        />
        <span
          aria-hidden="true"
          className="spotlight-volume-thumb"
          style={{ left: `${displayedVolumePercent}%` }}
        />
        <input
          className="spotlight-volume-range"
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
      </div>
    </div>
  )
}
