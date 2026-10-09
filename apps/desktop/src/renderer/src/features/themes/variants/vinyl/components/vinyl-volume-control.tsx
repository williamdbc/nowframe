import { useRef, useState } from 'react'

import { useDismissibleMenu } from '@/shared/hooks/useDismissibleMenu'

import volumeIcon from '../assets/volume.svg'
import { VinylIcon } from './vinyl-icon'

interface VinylVolumeControlProps {
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

export function VinylVolumeControl({
  canSetVolume,
  isPending,
  onCommitVolume,
  onSetVolume,
  onToggleMute,
  volumePercent
}: VinylVolumeControlProps): React.JSX.Element {
  const { closeMenu, containerRef, isOpen, toggleMenu, triggerRef } = useDismissibleMenu()
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
    <div className="vinyl-volume" ref={containerRef}>
      <button
        className="vinyl-control"
        type="button"
        ref={triggerRef}
        aria-label="Volume"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        data-active={isOpen}
        disabled={isDisabled}
        onClick={toggleMenu}
      >
        <VinylIcon className="size-full" source={volumeIcon} />
      </button>

      {isOpen && (
        <div className="vinyl-volume-panel" role="dialog" aria-label="Volume" aria-busy={isPending}>
          <button
            className="vinyl-mute"
            type="button"
            aria-label={isMuted ? 'Restaurar volume' : 'Silenciar'}
            data-muted={isMuted}
            disabled={isDisabled}
            onClick={() => {
              onToggleMute()
              closeMenu()
            }}
          >
            <VinylIcon className="size-full" source={volumeIcon} />
          </button>

          <div className="vinyl-volume-track">
            <div className="vinyl-volume-fill" style={{ width: `${displayedVolumePercent}%` }} />
            <span
              aria-hidden="true"
              className="vinyl-volume-thumb"
              style={{ left: `${displayedVolumePercent}%` }}
            />
            <input
              className="vinyl-volume-range"
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
      )}
    </div>
  )
}
