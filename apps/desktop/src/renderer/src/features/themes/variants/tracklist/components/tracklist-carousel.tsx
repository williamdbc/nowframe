import { useEffect, useRef } from 'react'
import { Disc3, LoaderCircle } from 'lucide-react'

import type { SpotifyTracklistTrack } from '../../../../../../../contracts/music-display-api'

interface TracklistCarouselProps {
  contextName: string
  currentTrackId: string | null
  fallbackImageUrl: string | null
  isPending: boolean
  isPlayPending: boolean
  onPlayTrack: (track: SpotifyTracklistTrack) => void
  tracks: readonly SpotifyTracklistTrack[]
}

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
  const currentTrack = tracks.find((track) => track.id === currentTrackId)

  useEffect(() => {
    currentTrackRef.current?.scrollIntoView?.({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    })
  }, [currentTrackId, tracks])

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
      className="tracklist-scroll flex snap-x snap-mandatory items-end gap-5 overflow-x-auto px-[calc(50%-5.5rem)] pt-2 pb-2"
      aria-label={`Faixas de ${contextName}`}
    >
      {tracks.map((track) => {
        const isCurrent = track === currentTrack

        return (
          <button
            key={`${track.id}:${track.position}`}
            ref={isCurrent ? currentTrackRef : undefined}
            className={`tracklist-card group w-[7.5rem] shrink-0 snap-center text-left transition duration-300 focus-visible:rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8ee3c2] disabled:cursor-not-allowed ${isCurrent ? 'tracklist-card-current w-[11rem] opacity-100' : 'opacity-52 hover:-translate-y-1 hover:opacity-85'}`}
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
