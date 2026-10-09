import { Disc3 } from 'lucide-react'
import { useRef } from 'react'

import lightSweep from '../assets/light.svg'
import shadeSweep from '../assets/shade.svg'
import { useVinylRotation } from '../hooks/useVinylRotation'

interface VinylRecordProps {
  collectionName: string | null
  imageUrl: string | null
  title: string
}

const grooves = [
  { isFilled: true, scale: 0.4554 },
  { isFilled: false, scale: 0.6089 },
  { isFilled: false, scale: 0.754 },
  { isFilled: false, scale: 0.8927 }
]

export function VinylRecord({
  collectionName,
  imageUrl,
  title
}: VinylRecordProps): React.JSX.Element {
  const recordRef = useRef<HTMLDivElement>(null)
  useVinylRotation(recordRef)

  return (
    <div className="vinyl-record" ref={recordRef}>
      <div className="vinyl-record-turn">
        <div aria-hidden="true" className="vinyl-record-environment">
          <div className="vinyl-record-sweep vinyl-record-sweep--light">
            <img alt="" src={lightSweep} />
          </div>
          <div className="vinyl-record-sweep vinyl-record-sweep--shade">
            <img alt="" src={shadeSweep} />
          </div>
        </div>

        {grooves.map(({ isFilled, scale }) => (
          <div
            aria-hidden="true"
            className="vinyl-groove"
            data-filled={isFilled}
            key={scale}
            style={{ height: `${scale * 100}%`, width: `${scale * 100}%` }}
          />
        ))}

        <div className="vinyl-label">
          {imageUrl ? (
            <img
              key={imageUrl}
              src={imageUrl}
              alt={`Capa de ${collectionName ?? title}`}
              className="vinyl-label-image"
            />
          ) : (
            <div className="vinyl-label-placeholder">
              <Disc3 aria-hidden="true" className="size-1/4 text-white/12" />
              <span className="sr-only">Nenhuma capa de álbum disponível</span>
            </div>
          )}

          <div aria-hidden="true" className="vinyl-spindle">
            <div className="vinyl-spindle-ring">
              <div className="vinyl-spindle-core" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
