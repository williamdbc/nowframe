import { Disc3 } from 'lucide-react'
import { useRef } from 'react'

import { useCassetteMotion } from '../hooks/useCassetteMotion'

interface CassetteDeckProps {
  collectionName: string | null
  creatorNames: string
  imageUrl: string | null
  title: string
}

function CassetteReel({ side }: { side: 'left' | 'right' }): React.JSX.Element {
  return (
    <div aria-hidden="true" className={`cassette-reel cassette-reel--${side}`}>
      <div className="cassette-tape-pack" />
      <div className="cassette-reel-hub">
        {Array.from({ length: 8 }, (_, index) => (
          <span key={index} style={{ transform: `rotate(${index * 45}deg)` }} />
        ))}
      </div>
    </div>
  )
}

export function CassetteDeck({
  collectionName,
  creatorNames,
  imageUrl,
  title
}: CassetteDeckProps): React.JSX.Element {
  const cassetteRef = useRef<HTMLElement>(null)
  useCassetteMotion(cassetteRef)

  return (
    <section ref={cassetteRef} className="cassette-shell" aria-label="Fita cassete em reprodução">
      <span aria-hidden="true" className="cassette-screw cassette-screw--top-left" />
      <span aria-hidden="true" className="cassette-screw cassette-screw--top-right" />
      <span aria-hidden="true" className="cassette-screw cassette-screw--bottom-left" />
      <span aria-hidden="true" className="cassette-screw cassette-screw--bottom-right" />

      <div className="cassette-label">
        <div className="cassette-label-copy">
          <p className="cassette-artist">{creatorNames}</p>
          <h1 className="cassette-title">{title}</h1>
          {collectionName && <p className="cassette-album">{collectionName}</p>}
        </div>

        <div className="cassette-cover">
          {imageUrl ? (
            <img src={imageUrl} alt={`Capa de ${collectionName ?? title}`} />
          ) : (
            <div className="cassette-cover-placeholder">
              <Disc3 aria-hidden="true" />
              <span className="sr-only">Nenhuma capa de álbum disponível</span>
            </div>
          )}
        </div>

        <div className="cassette-rule cassette-rule--top" />
        <div className="cassette-rule cassette-rule--bottom" />

        <div className="cassette-window">
          <CassetteReel side="left" />
          <div aria-hidden="true" className="cassette-window-center">
            <span />
            <span />
            <span />
          </div>
          <CassetteReel side="right" />
          <div aria-hidden="true" className="cassette-tape-span" />
        </div>
      </div>

      <div aria-hidden="true" className="cassette-pressure-pad">
        <span className="cassette-pressure-hole cassette-pressure-hole--left" />
        <span className="cassette-pressure-slot" />
        <span className="cassette-pressure-hole cassette-pressure-hole--right" />
      </div>
    </section>
  )
}
