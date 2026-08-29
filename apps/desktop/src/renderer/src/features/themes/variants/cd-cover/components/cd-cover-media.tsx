import { Disc3 } from 'lucide-react'
import { useRef } from 'react'

import discImage from '../assets/disc.png'
import { useCdDiscRotation } from '../hooks/useCdDiscRotation'

interface CdCoverMediaProps {
  collectionName: string | null
  imageUrl: string | null
  title: string
}

/**
 * A capa e o disco saindo por trás dela, como o Figma desenha: a capa em 340px na frente,
 * o disco em 300px deslocado para a direita e um pouco para baixo.
 *
 * O disco é um único PNG exportado do grupo do Figma. No arquivo ele é uma pilha de treze
 * elipses com `hard-light`, `overlay` e `color-burn` compondo a iridescência; achatar isso
 * num asset só evita treze imagens e treze camadas de composição a cada frame — e, como o
 * disco gira inteiro, é justamente a unidade que precisa girar.
 */
export function CdCoverMedia({
  collectionName,
  imageUrl,
  title
}: CdCoverMediaProps): React.JSX.Element {
  const discRef = useRef<HTMLDivElement>(null)
  useCdDiscRotation(discRef)

  return (
    <div className="cd-cover-media">
      <div aria-hidden="true" className="cd-cover-disc" ref={discRef}>
        <img alt="" className="cd-cover-disc-image" src={discImage} />
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
