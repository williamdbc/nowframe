import { useCallback, useEffect, useRef, useState } from 'react'

import { playbackClock } from '../utils/playback-clock'

interface PlaybackProgressControlProps {
  accentColor?: string
  canSeek: boolean
  className?: string
  durationMs: number
  isPending: boolean
  onSeek: (positionMs: number) => void
  positionMs: number
  rangeClassName?: string
  timeClassName?: string
  trackColor?: string
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

const keyboardSeekStepsMs: Record<string, number> = {
  ArrowDown: -5_000,
  ArrowLeft: -5_000,
  ArrowRight: 5_000,
  ArrowUp: 5_000,
  PageDown: -30_000,
  PageUp: 30_000
}

function getKeyboardSeekPosition(
  key: string,
  currentPositionMs: number,
  durationMs: number
): number | null {
  if (key === 'Home') return 0
  if (key === 'End') return durationMs

  const stepMs = keyboardSeekStepsMs[key]
  if (stepMs === undefined) return null

  return Math.min(durationMs, Math.max(0, currentPositionMs + stepMs))
}

function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function PlaybackProgressControl({
  accentColor = 'white',
  canSeek,
  className = '',
  durationMs,
  isPending,
  onSeek,
  positionMs,
  rangeClassName = '',
  timeClassName = 'mt-3 flex justify-between text-sm font-medium text-white/38 tabular-nums',
  trackColor = 'rgba(255, 255, 255, 0.12)'
}: PlaybackProgressControlProps): React.JSX.Element {
  const [isPreviewing, setIsPreviewing] = useState(false)
  const sliderRef = useRef<HTMLInputElement>(null)
  const elapsedLabelRef = useRef<HTMLSpanElement>(null)
  const isPreviewingRef = useRef(false)
  const isDisabled = !canSeek || durationMs === 0 || isPending

  const paint = useCallback(
    (nextPositionMs: number): void => {
      const clampedMs = Math.min(durationMs, Math.max(0, nextPositionMs))
      const percentage = durationMs > 0 ? (clampedMs / durationMs) * 100 : 0
      const slider = sliderRef.current

      if (slider) {
        slider.value = String(clampedMs)
        slider.style.setProperty('--playback-progress', `${percentage}%`)
        slider.setAttribute(
          'aria-valuetext',
          `${formatDuration(clampedMs)} de ${formatDuration(durationMs)}`
        )
      }

      if (elapsedLabelRef.current) {
        elapsedLabelRef.current.textContent = formatDuration(clampedMs)
      }
    },
    [durationMs]
  )

  useEffect(() => {
    const paintFromClock = (): void => {
      if (isPreviewingRef.current) return
      paint(playbackClock.hasAnchor() ? playbackClock.getPositionMs() : positionMs)
    }

    paintFromClock()

    return playbackClock.subscribe(paintFromClock)
  }, [paint, positionMs])

  const beginPreview = (nextPositionMs: number): void => {
    isPreviewingRef.current = true
    setIsPreviewing(true)
    paint(nextPositionMs)
  }

  const commitPosition = (nextPositionMs: number): void => {
    isPreviewingRef.current = false
    setIsPreviewing(false)
    paint(nextPositionMs)
    onSeek(Math.round(nextPositionMs))
  }

  return (
    <div className={className} aria-busy={isPending}>
      <input
        ref={sliderRef}
        className={`player-range player-progress-range ${rangeClassName}`}
        type="range"
        min={0}
        max={durationMs}
        step={1}
        defaultValue={0}
        aria-label="Posição da reprodução"
        disabled={isDisabled}
        style={{
          background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} var(--playback-progress, 0%), ${trackColor} var(--playback-progress, 0%), ${trackColor} 100%)`
        }}
        onBlur={(event) => {
          if (isPreviewing) commitPosition(Number(event.currentTarget.value))
        }}
        onChange={(event) => beginPreview(Number(event.currentTarget.value))}
        onKeyDown={(event) => {
          const nextPositionMs = getKeyboardSeekPosition(
            event.key,
            Number(event.currentTarget.value),
            durationMs
          )
          if (nextPositionMs === null) return

          event.preventDefault()
          beginPreview(nextPositionMs)
        }}
        onKeyUp={(event) => {
          if (rangeCommitKeys.has(event.key)) commitPosition(Number(event.currentTarget.value))
        }}
        onPointerUp={(event) => commitPosition(Number(event.currentTarget.value))}
      />
      <div className={timeClassName}>
        <span ref={elapsedLabelRef} />
        <span>{formatDuration(durationMs)}</span>
      </div>
    </div>
  )
}
