import { useCallback, useEffect, useRef, useState } from 'react'
import { Disc3, LoaderCircle } from 'lucide-react'

import type { SpotifyTracklistTrack } from '../../../../../../../contracts/nowframe-api'

interface TracklistCarouselProps {
  contextName: string
  currentTrackId: string | null
  fallbackImageUrl: string | null
  isPending: boolean
  isPlayPending: boolean
  onPlayTrack: (track: SpotifyTracklistTrack) => void
  tracks: readonly SpotifyTracklistTrack[]
}

interface TracklistDragState {
  hasDragged: boolean
  lastTimestamp: number
  lastX: number
  pointerId: number
  startTimestamp: number
  startScrollLeft: number
  startX: number
  velocity: number
}

interface TracklistMomentumContext {
  currentTrackId: string | null
  tracks: readonly SpotifyTracklistTrack[]
}

const dragThresholdPx = 5
const maximumMomentumVelocity = 1.75
const minimumMomentumVelocity = 0.08
const momentumFrictionPerFrame = 0.9
const maximumMomentumFrameDurationMs = 32
const momentumReleaseGracePeriodMs = 80

export function TracklistCarousel({
  contextName,
  currentTrackId,
  fallbackImageUrl,
  isPending,
  isPlayPending,
  onPlayTrack,
  tracks
}: TracklistCarouselProps): React.JSX.Element {
  const currentTrackRef = useRef<HTMLButtonElement>(null)
  const dragStateRef = useRef<TracklistDragState | null>(null)
  const momentumFrameRef = useRef<number | null>(null)
  const suppressClickRef = useRef(false)
  const [isDragging, setIsDragging] = useState(false)
  const [momentumContext, setMomentumContext] = useState<TracklistMomentumContext | null>(null)
  const currentTrack = tracks.find((track) => track.id === currentTrackId)
  const isGliding =
    momentumContext !== null &&
    momentumContext.currentTrackId === currentTrackId &&
    momentumContext.tracks === tracks

  const stopMomentum = useCallback((): void => {
    if (momentumFrameRef.current !== null) {
      window.cancelAnimationFrame(momentumFrameRef.current)
      momentumFrameRef.current = null
    }

    setMomentumContext(null)
  }, [])

  useEffect(() => {
    if (momentumFrameRef.current !== null) {
      window.cancelAnimationFrame(momentumFrameRef.current)
      momentumFrameRef.current = null
    }

    currentTrackRef.current?.scrollIntoView?.({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    })
  }, [currentTrackId, tracks])

  useEffect(
    () => () => {
      if (momentumFrameRef.current !== null) {
        window.cancelAnimationFrame(momentumFrameRef.current)
      }
    },
    []
  )

  const startMomentum = (container: HTMLDivElement, initialVelocity: number): void => {
    let velocity = Math.max(
      -maximumMomentumVelocity,
      Math.min(maximumMomentumVelocity, initialVelocity)
    )

    if (Math.abs(velocity) < minimumMomentumVelocity) return

    let previousTimestamp = performance.now()
    setMomentumContext({ currentTrackId, tracks })

    const animateMomentum = (timestamp: number): void => {
      const elapsedMs = Math.min(
        maximumMomentumFrameDurationMs,
        Math.max(0, timestamp - previousTimestamp)
      )
      const previousScrollLeft = container.scrollLeft
      container.scrollLeft += velocity * elapsedMs
      previousTimestamp = timestamp

      const friction = momentumFrictionPerFrame ** (elapsedMs / (1000 / 60))
      velocity *= friction

      const reachedBoundary = elapsedMs > 0 && container.scrollLeft === previousScrollLeft
      if (reachedBoundary || Math.abs(velocity) < minimumMomentumVelocity) {
        momentumFrameRef.current = null
        setMomentumContext(null)
        return
      }

      momentumFrameRef.current = window.requestAnimationFrame(animateMomentum)
    }

    momentumFrameRef.current = window.requestAnimationFrame(animateMomentum)
  }

  const finishDrag = (
    container: HTMLDivElement,
    pointerId: number,
    shouldContinueMovement: boolean
  ): void => {
    const dragState = dragStateRef.current
    if (!dragState || dragState.pointerId !== pointerId) return

    suppressClickRef.current = dragState.hasDragged
    dragStateRef.current = null
    setIsDragging(false)

    if (container.hasPointerCapture?.(pointerId)) {
      container.releasePointerCapture(pointerId)
    }

    const releasedAfterPause =
      performance.now() - dragState.lastTimestamp > momentumReleaseGracePeriodMs
    if (dragState.hasDragged && shouldContinueMovement && !releasedAfterPause) {
      startMomentum(container, dragState.velocity)
    }

    if (suppressClickRef.current) {
      window.setTimeout(() => {
        suppressClickRef.current = false
      }, 0)
    }
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>): void => {
    stopMomentum()
    if (event.button !== 0 || event.pointerType !== 'mouse') return

    const timestamp = performance.now()
    dragStateRef.current = {
      hasDragged: false,
      lastTimestamp: timestamp,
      lastX: event.clientX,
      pointerId: event.pointerId,
      startTimestamp: timestamp,
      startScrollLeft: event.currentTarget.scrollLeft,
      startX: event.clientX,
      velocity: 0
    }
    suppressClickRef.current = false
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>): void => {
    const dragState = dragStateRef.current
    if (!dragState || dragState.pointerId !== event.pointerId) return

    const movementX = event.clientX - dragState.startX
    if (!dragState.hasDragged && Math.abs(movementX) <= dragThresholdPx) return

    if (!dragState.hasDragged) {
      dragState.hasDragged = true
      setIsDragging(true)
      event.currentTarget.setPointerCapture?.(event.pointerId)
    }

    const timestamp = performance.now()
    const elapsedSinceLastMove = Math.max(1, timestamp - dragState.lastTimestamp)
    const elapsedSinceDragStarted = Math.max(1, timestamp - dragState.startTimestamp)
    const instantaneousVelocity = -(event.clientX - dragState.lastX) / elapsedSinceLastMove
    const averageVelocity = -movementX / elapsedSinceDragStarted
    dragState.velocity = instantaneousVelocity * 0.7 + averageVelocity * 0.3
    dragState.lastTimestamp = timestamp
    dragState.lastX = event.clientX

    event.preventDefault()
    event.currentTarget.scrollLeft = dragState.startScrollLeft - movementX
  }

  const handleClickCapture = (event: React.MouseEvent<HTMLDivElement>): void => {
    if (!suppressClickRef.current) return

    event.preventDefault()
    event.stopPropagation()
    suppressClickRef.current = false
  }

  if (isPending) {
    return (
      <div className="flex h-44 items-center justify-center text-sm text-white/38" role="status">
        <LoaderCircle aria-hidden="true" className="mr-2 h-5 w-5 animate-spin" />
        Carregando lista de faixas...
      </div>
    )
  }

  if (tracks.length === 0) {
    return (
      <div className="flex h-44 items-center justify-center text-sm text-white/32">
        A lista de faixas aparecerá quando um álbum ou playlist estiver tocando.
      </div>
    )
  }

  return (
    <div
      className={`tracklist-scroll flex items-end gap-5 overflow-x-auto px-[calc(50%-5.5rem)] pt-2 pb-2 ${isDragging ? 'tracklist-scroll-dragging' : ''} ${isGliding ? 'tracklist-scroll-gliding' : ''}`}
      aria-label={`Faixas de ${contextName}`}
      onClickCapture={handleClickCapture}
      onPointerCancel={(event) => finishDrag(event.currentTarget, event.pointerId, false)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => finishDrag(event.currentTarget, event.pointerId, true)}
      onWheel={stopMomentum}
    >
      {tracks.map((track) => {
        const isCurrent = track === currentTrack

        return (
          <button
            key={`${track.id}:${track.position}`}
            ref={isCurrent ? currentTrackRef : undefined}
            className={`tracklist-card group w-[7.5rem] shrink-0 text-left transition duration-300 focus-visible:rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8ee3c2] ${isCurrent ? 'tracklist-card-current w-[11rem] opacity-100' : 'opacity-52 hover:-translate-y-1 hover:opacity-85'}`}
            type="button"
            aria-current={isCurrent ? 'true' : undefined}
            aria-label={`${isCurrent ? 'Tocando agora: ' : 'Reproduzir '}${track.title}`}
            disabled={isCurrent || !track.isPlayable || isPlayPending}
            onClick={() => onPlayTrack(track)}
          >
            <span
              className={`block aspect-square overflow-hidden border bg-white/[0.04] shadow-[0_18px_50px_rgba(0,0,0,0.38)] transition ${isCurrent ? 'rounded-[1.7rem] border-[#8ee3c2]/35' : 'rounded-2xl border-white/10'}`}
            >
              {(track.imageUrl ?? fallbackImageUrl) ? (
                <img
                  src={track.imageUrl ?? fallbackImageUrl ?? undefined}
                  alt={isCurrent ? `Capa de ${track.title}` : ''}
                  aria-hidden={isCurrent ? undefined : 'true'}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-white/[0.04]">
                  <Disc3 aria-hidden="true" className="h-1/3 w-1/3 text-white/14" />
                  {isCurrent && <span className="sr-only">Nenhuma capa de álbum disponível</span>}
                </span>
              )}
            </span>
            <span
              className={`mt-2.5 block truncate text-center font-medium ${isCurrent ? 'text-sm text-white/92' : 'text-xs text-white/72'}`}
            >
              {track.position + 1}. {track.title}
            </span>
          </button>
        )
      })}
    </div>
  )
}
