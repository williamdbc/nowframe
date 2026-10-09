import { useRef, useState } from 'react'

import { useDismissibleMenu } from '@/shared/hooks/useDismissibleMenu'

import volumeIcon from '../assets/volume.svg'
import { PosterIcon } from './poster-icon'

interface PosterVolumeControlProps {
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

export function PosterVolumeControl({
  canSetVolume,
  isPending,
  onCommitVolume,
  onSetVolume,
  onToggleMute,
  volumePercent
}: PosterVolumeControlProps): React.JSX.Element {
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
    <div className="poster-volume" ref={containerRef}>
      <button
        className="poster-control"
        type="button"
        ref={triggerRef}
        aria-label="Volume"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        data-active={isOpen}
        disabled={isDisabled}
        onClick={toggleMenu}
      >
        <PosterIcon className="size-full" source={volumeIcon} />
      </button>

      {isOpen && (
        <div
          className="poster-volume-panel"
          role="dialog"
          aria-label="Volume"
          aria-busy={isPending}
        >
          <div className="poster-volume-column">
            <div className="poster-volume-track">
              <div
                className="poster-volume-fill"
                style={{ height: `${displayedVolumePercent}%` }}
              />
              <input
                className="poster-volume-range"
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
                  if (rangeCommitKeys.has(event.key))
                    commitVolume(Number(event.currentTarget.value))
                }}
                onPointerUp={(event) => commitVolume(Number(event.currentTarget.value))}
              />
            </div>

            <button
              className="poster-mute"
              type="button"
              aria-label={isMuted ? 'Restaurar volume' : 'Silenciar'}
              data-muted={isMuted}
              disabled={isDisabled}
              onClick={() => {
                onToggleMute()
                closeMenu()
              }}
            >
              <PosterIcon className="size-full" source={volumeIcon} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
