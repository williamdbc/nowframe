import { useState } from 'react'

interface PlaybackProgressControlProps {
  canSeek: boolean
  durationMs: number
  isPending: boolean
  onSeek: (positionMs: number) => void
  positionMs: number
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

function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function PlaybackProgressControl({
  canSeek,
  durationMs,
  isPending,
  onSeek,
  positionMs
}: PlaybackProgressControlProps): React.JSX.Element {
  const [previewPositionMs, setPreviewPositionMs] = useState<number | null>(null)
  const displayedPositionMs = Math.min(durationMs, previewPositionMs ?? positionMs)
  const progressPercentage = durationMs > 0 ? (displayedPositionMs / durationMs) * 100 : 0
  const isDisabled = !canSeek || durationMs === 0 || isPending

  const commitPosition = (nextPositionMs: number): void => {
    setPreviewPositionMs(null)
    onSeek(Math.round(nextPositionMs))
  }

  return (
    <div aria-busy={isPending}>
      <input
        className="player-range player-progress-range"
        type="range"
        min={0}
        max={durationMs}
        step={1_000}
        value={displayedPositionMs}
        aria-label="Posição da reprodução"
        aria-valuetext={`${formatDuration(displayedPositionMs)} de ${formatDuration(durationMs)}`}
        disabled={isDisabled}
        style={{
          background: `linear-gradient(to right, white 0%, white ${progressPercentage}%, rgba(255, 255, 255, 0.12) ${progressPercentage}%, rgba(255, 255, 255, 0.12) 100%)`
        }}
        onBlur={(event) => {
          if (previewPositionMs !== null) commitPosition(Number(event.currentTarget.value))
        }}
        onChange={(event) => setPreviewPositionMs(Number(event.currentTarget.value))}
        onKeyUp={(event) => {
          if (rangeCommitKeys.has(event.key)) commitPosition(Number(event.currentTarget.value))
        }}
        onPointerUp={(event) => commitPosition(Number(event.currentTarget.value))}
      />
      <div className="mt-3 flex justify-between text-sm font-medium text-white/38 tabular-nums">
        <span>{formatDuration(displayedPositionMs)}</span>
        <span>{formatDuration(durationMs)}</span>
      </div>
    </div>
  )
}
