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

/**
 * Diâmetros dos quatro sulcos, em fração do disco, medidos no Figma sobre 1280px. O mais
 * interno é o único preenchido: um anel da própria cor do disco a 25%, que abafa de leve o
 * reflexo do ambiente na região do rótulo.
 */
const grooves = [
  { isFilled: true, scale: 0.4554 },
  { isFilled: false, scale: 0.6089 },
  { isFilled: false, scale: 0.754 },
  { isFilled: false, scale: 0.8927 }
]

/**
 * O disco: um vinil do tamanho da tela com o centro apoiado na borda de cima, de modo que
 * só a metade de baixo aparece. É o desenho do Figma, e é o que deixa o rótulo — a capa do
 * álbum — grande o bastante para a rotação ser legível.
 *
 * Tudo dentro do recorte gira junto — corpo, brilho, varreduras, sulcos e rótulo — numa
 * camada só, `.vinyl-record-turn`. Só o recorte, a borda e a sombra ficam parados.
 *
 * Que a camada seja quadrada e o recorte redondo não abre buraco em ângulo nenhum: o
 * círculo do recorte é o círculo inscrito no quadrado, e um círculo inscrito é invariante
 * à rotação em torno do próprio centro.
 */
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
        {/* Duas varreduras opostas, exportadas do Figma com o ruído e o desfoque que fazem
            a borda do reflexo parecer luz e não um cone de gradiente. */}
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

          {/* O furo central: três anéis metálicos concêntricos, todos do Figma. */}
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
