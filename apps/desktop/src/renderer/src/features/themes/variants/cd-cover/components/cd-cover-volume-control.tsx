import { useRef, useState } from 'react'

import volumeIcon from '../assets/volume.svg'
import { CdCoverIcon } from './cd-cover-icon'

interface CdCoverVolumeControlProps {
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

export function CdCoverVolumeControl({
  canSetVolume,
  isPending,
  onCommitVolume,
  onSetVolume,
  onToggleMute,
  volumePercent
}: CdCoverVolumeControlProps): React.JSX.Element {
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
    <div className="cd-cover-volume" aria-busy={isPending}>
      <button
        className="cd-cover-mute"
        type="button"
        aria-label={isMuted ? 'Restaurar volume' : 'Silenciar'}
        data-muted={isMuted}
        disabled={isDisabled}
        onClick={onToggleMute}
      >
        <CdCoverIcon className="size-full" source={volumeIcon} />
      </button>

      <div className="cd-cover-volume-track">
        <div className="cd-cover-volume-fill" style={{ width: `${displayedVolumePercent}%` }} />
        <span
          aria-hidden="true"
          className="cd-cover-volume-thumb"
          style={{ left: `${displayedVolumePercent}%` }}
        />
        <input
          className="cd-cover-volume-range"
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
