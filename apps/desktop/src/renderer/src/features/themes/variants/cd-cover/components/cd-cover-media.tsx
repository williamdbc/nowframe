import { Disc3 } from 'lucide-react'
import { useRef } from 'react'

import discImage from '../assets/disc.png'
import { useCdCoverAccent } from '../hooks/useCdCoverAccent'
import { useCdDiscRotation } from '../hooks/useCdDiscRotation'

interface CdCoverMediaProps {
  collectionName: string | null
  imageUrl: string | null
  title: string
}

export function CdCoverMedia({
  collectionName,
  imageUrl,
  title
}: CdCoverMediaProps): React.JSX.Element {
  const discRef = useRef<HTMLDivElement>(null)
  useCdDiscRotation(discRef)
  const accentColor = useCdCoverAccent(imageUrl)

  return (
    <div className="cd-cover-media">
      <div aria-hidden="true" className="cd-cover-disc" ref={discRef}>
        <img alt="" className="cd-cover-disc-image" src={discImage} />

        {accentColor && (
          <div
            className="cd-cover-disc-tint"
            style={{
              backgroundColor: accentColor,

              maskImage: `url("${discImage}")`,
              WebkitMaskImage: `url("${discImage}")`
            }}
          />
        )}
      </div>

      <div className="cd-cover-sleeve">
        {imageUrl ? (
          <img
            key={imageUrl}
            src={imageUrl}
            alt={`Capa de ${collectionName ?? title}`}
            className="cd-cover-sleeve-image"
          />
        ) : (
          <div className="cd-cover-sleeve-placeholder">
            <Disc3 aria-hidden="true" className="size-1/3 text-black/12" />
            <span className="sr-only">Nenhuma capa de álbum disponível</span>
          </div>
        )}
        <div aria-hidden="true" className="cd-cover-sleeve-sheen" />
      </div>
    </div>
  )
}
