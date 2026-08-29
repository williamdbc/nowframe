import { useMemo, useRef, useState } from 'react'

import type { SpotifyTracklistTrack } from '../../../../../../../contracts/nowframe-api'

interface OrbitTrackSelectorProps {
  currentTrackId: string | null
  isPlayPending: boolean
  onPlayTrack: (track: SpotifyTracklistTrack) => void
  tracks: readonly SpotifyTracklistTrack[]
}

interface OrbitDragState {
  dragged: boolean
  pointerId: number
  startRotation: number
  startX: number
}

export function OrbitTrackSelector({
  currentTrackId,
  isPlayPending,
  onPlayTrack,
  tracks
}: OrbitTrackSelectorProps): React.JSX.Element {
  const [rotation, setRotation] = useState(0)
  const dragRef = useRef<OrbitDragState | null>(null)
  const suppressClickRef = useRef(false)
  const visibleTracks = useMemo(() => {
    if (tracks.length <= 12) return tracks
    const currentIndex = Math.max(
      0,
      tracks.findIndex((track) => track.id === currentTrackId)
    )
    return Array.from(
      { length: 12 },
      (_, offset) => tracks[(currentIndex - 5 + offset + tracks.length) % tracks.length]
    )
  }, [currentTrackId, tracks])

  return (
    <div
      className="orbit-selector"
      aria-label="Órbita de faixas"
      style={{ '--orbit-rotation': `${rotation}deg` } as React.CSSProperties}
      onPointerDown={(event) => {
        if (event.button !== 0) return
        dragRef.current = {
          pointerId: event.pointerId,
          startRotation: rotation,
          startX: event.clientX,
          dragged: false
        }
        event.currentTarget.setPointerCapture?.(event.pointerId)
      }}
      onPointerMove={(event) => {
        const drag = dragRef.current
        if (!drag || drag.pointerId !== event.pointerId) return
        const movement = event.clientX - drag.startX
        if (Math.abs(movement) > 4) drag.dragged = true
        setRotation(drag.startRotation + movement * 0.32)
      }}
      onPointerUp={(event) => {
        if (dragRef.current?.pointerId === event.pointerId) {
          suppressClickRef.current = dragRef.current.dragged
          dragRef.current = null
        }
        if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId)
        }
      }}
      onPointerCancel={() => {
        suppressClickRef.current = true
        dragRef.current = null
      }}
    >
      {visibleTracks.map((track, index) => {
        const isCurrent = track.id === currentTrackId
        const angle = (360 / Math.max(visibleTracks.length, 1)) * index
        return (
          <button
            key={`${track.id}:${track.position}`}
            className="orbit-node"
            type="button"
            aria-current={isCurrent ? 'true' : undefined}
            aria-label={`${isCurrent ? 'Tocando agora: ' : 'Reproduzir '}${track.title}`}
            data-current={isCurrent}
            disabled={isCurrent || !track.isPlayable || isPlayPending}
            style={
              {
                '--orbit-angle': `calc(${angle}deg + var(--orbit-rotation))`
              } as React.CSSProperties
            }
            onClick={() => {
              if (suppressClickRef.current) {
                suppressClickRef.current = false
                return
              }

              onPlayTrack(track)
            }}
          >
            <span>{String(track.position + 1).padStart(2, '0')}</span>
            <strong>{track.title}</strong>
          </button>
        )
      })}
    </div>
  )
}
