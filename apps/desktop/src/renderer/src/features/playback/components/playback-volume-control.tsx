import { Volume1, Volume2, VolumeX } from 'lucide-react'
import { useRef, useState } from 'react'

interface PlaybackVolumeControlProps {
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

export function PlaybackVolumeControl({
  canSetVolume,
  isPending,
  onCommitVolume,
  onSetVolume,
  onToggleMute,
  volumePercent
}: PlaybackVolumeControlProps): React.JSX.Element {
  const [previewVolumePercent, setPreviewVolumePercent] = useState<number | null>(null)
  const committedVolumePercent = useRef<number | null>(null)
  const displayedVolumePercent = previewVolumePercent ?? volumePercent ?? 0
  const isMuted = volumePercent === 0
  const isDisabled = !canSetVolume || volumePercent === null
  const VolumeIcon = isMuted ? VolumeX : displayedVolumePercent <= 50 ? Volume1 : Volume2

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
    <div className="flex items-center gap-2" aria-busy={isPending}>
      <button
        className="player-volume-button"
        type="button"
        aria-label={isMuted ? 'Restaurar volume' : 'Silenciar'}
        disabled={isDisabled}
        onClick={onToggleMute}
      >
        <VolumeIcon aria-hidden="true" className="h-4 w-4" />
      </button>
      <input
        className="player-range player-volume-range"
        type="range"
        min={0}
        max={100}
        step={1}
        value={displayedVolumePercent}
        aria-label="Volume"
        aria-valuetext={`${displayedVolumePercent}%`}
        disabled={isDisabled}
        style={{
          background: `linear-gradient(to right, rgba(255, 255, 255, 0.62) 0%, rgba(255, 255, 255, 0.62) ${displayedVolumePercent}%, rgba(255, 255, 255, 0.12) ${displayedVolumePercent}%, rgba(255, 255, 255, 0.12) 100%)`
        }}
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
      <span className="w-9 text-right text-xs tabular-nums">
        {volumePercent === null ? '—' : `${displayedVolumePercent}%`}
      </span>
    </div>
  )
}
