import { useCallback, useEffect, useRef, useState } from 'react'
import { LoaderCircle } from 'lucide-react'

import type { SpotifyTracklistTrack } from '../../../../../../contracts/nowframe-api'

interface InteractiveTrackRailProps {
  className?: string
  contextName: string
  currentTrackId: string | null
  emptyMessage?: string
  isPending: boolean
  isPlayPending: boolean
  itemClassName?: string
  onPlayTrack: (track: SpotifyTracklistTrack) => void
  renderTrack: (track: SpotifyTracklistTrack, isCurrent: boolean) => React.ReactNode
  tracks: readonly SpotifyTracklistTrack[]
}

interface DragState {
  hasDragged: boolean
  lastTimestamp: number
  lastX: number
  pointerId: number
  startScrollLeft: number
  startX: number
  velocity: number
}

const dragThresholdPx = 5
const minimumVelocity = 0.08
const maximumVelocity = 1.8
const friction = 0.9

export function InteractiveTrackRail({
  className = '',
  contextName,
  currentTrackId,
  emptyMessage = 'A lista de faixas aparecerá quando um álbum ou playlist estiver tocando.',
  isPending,
  isPlayPending,
  itemClassName = '',
  onPlayTrack,
  renderTrack,
  tracks
}: InteractiveTrackRailProps): React.JSX.Element {
  const currentTrackRef = useRef<HTMLButtonElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const frameRef = useRef<number | null>(null)
  const suppressClickRef = useRef(false)
  const [isDragging, setIsDragging] = useState(false)

  const stopMomentum = useCallback(() => {
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current)
    frameRef.current = null
  }, [])

  useEffect(() => {
    stopMomentum()
    currentTrackRef.current?.scrollIntoView?.({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    })
  }, [currentTrackId, stopMomentum, tracks])

  useEffect(() => stopMomentum, [stopMomentum])

  const startMomentum = (container: HTMLDivElement, initialVelocity: number): void => {
    let velocity = Math.max(-maximumVelocity, Math.min(maximumVelocity, initialVelocity))
    if (Math.abs(velocity) < minimumVelocity) return
    let previousTimestamp = performance.now()

    const animate = (timestamp: number): void => {
      const elapsed = Math.min(32, Math.max(0, timestamp - previousTimestamp))
      const previousScrollLeft = container.scrollLeft
      container.scrollLeft += velocity * elapsed
      previousTimestamp = timestamp
      velocity *= friction ** (elapsed / (1000 / 60))

      if (container.scrollLeft === previousScrollLeft || Math.abs(velocity) < minimumVelocity) {
        frameRef.current = null
        return
      }
      frameRef.current = window.requestAnimationFrame(animate)
    }
    frameRef.current = window.requestAnimationFrame(animate)
  }

  const finishDrag = (container: HTMLDivElement, pointerId: number): void => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== pointerId) return
    suppressClickRef.current = drag.hasDragged
    dragRef.current = null
    setIsDragging(false)
    if (container.hasPointerCapture?.(pointerId)) container.releasePointerCapture(pointerId)
    if (drag.hasDragged) startMomentum(container, drag.velocity)
    window.setTimeout(() => (suppressClickRef.current = false), 0)
  }

  if (isPending) {
    return (
      <div className="concept-track-state" role="status">
        <LoaderCircle aria-hidden="true" /> Carregando lista de faixas...
      </div>
    )
  }

  if (tracks.length === 0) return <div className="concept-track-state">{emptyMessage}</div>

  return (
    <div
      className={`concept-track-rail ${isDragging ? 'concept-track-rail--dragging' : ''} ${className}`}
      aria-label={`Faixas de ${contextName}`}
      onClickCapture={(event) => {
        if (!suppressClickRef.current) return
        event.preventDefault()
        event.stopPropagation()
        suppressClickRef.current = false
      }}
      onPointerDown={(event) => {
        stopMomentum()
        if (event.button !== 0 || event.pointerType !== 'mouse') return
        dragRef.current = {
          hasDragged: false,
          lastTimestamp: performance.now(),
          lastX: event.clientX,
          pointerId: event.pointerId,
          startScrollLeft: event.currentTarget.scrollLeft,
          startX: event.clientX,
          velocity: 0
        }
      }}
      onPointerMove={(event) => {
        const drag = dragRef.current
        if (!drag || drag.pointerId !== event.pointerId) return
        const movement = event.clientX - drag.startX
        if (!drag.hasDragged && Math.abs(movement) <= dragThresholdPx) return
        if (!drag.hasDragged) {
          drag.hasDragged = true
          setIsDragging(true)
          event.currentTarget.setPointerCapture?.(event.pointerId)
        }
        const now = performance.now()
        drag.velocity = -(event.clientX - drag.lastX) / Math.max(1, now - drag.lastTimestamp)
        drag.lastTimestamp = now
        drag.lastX = event.clientX
        event.preventDefault()
        event.currentTarget.scrollLeft = drag.startScrollLeft - movement
      }}
      onPointerUp={(event) => finishDrag(event.currentTarget, event.pointerId)}
      onPointerCancel={(event) => finishDrag(event.currentTarget, event.pointerId)}
      onWheel={stopMomentum}
    >
      {tracks.map((track) => {
        const isCurrent = track.id === currentTrackId
        return (
          <button
            key={`${track.id}:${track.position}`}
            ref={isCurrent ? currentTrackRef : undefined}
            className={`concept-track-item ${itemClassName}`}
            type="button"
            aria-current={isCurrent ? 'true' : undefined}
            aria-label={`${isCurrent ? 'Tocando agora: ' : 'Reproduzir '}${track.title}`}
            disabled={isCurrent || !track.isPlayable || isPlayPending}
            onClick={() => onPlayTrack(track)}
          >
            {renderTrack(track, isCurrent)}
          </button>
        )
      })}
    </div>
  )
}
