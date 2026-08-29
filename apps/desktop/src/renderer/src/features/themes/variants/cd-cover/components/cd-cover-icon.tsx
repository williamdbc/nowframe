interface CdCoverIconProps {
  className?: string
  'data-icon'?: string
  source: string
}

/**
 * Os ícones do tema vêm exportados do Figma como SVG de cor sólida. Renderizar
 * como máscara em vez de <img> preserva o traçado original e ainda deixa a cor
 * seguir o currentColor do botão, que é o que distingue os estados.
 */
export function CdCoverIcon({
  className = '',
  source,
  ...dataAttributes
}: CdCoverIconProps): React.JSX.Element {
  return (
    <span
      {...dataAttributes}
      aria-hidden="true"
      className={`cd-cover-icon ${className}`}
      // O Vite inlina o SVG como data URI contendo aspas simples, entao a URL
      // precisa ir entre aspas duplas ou o CSS descarta a mascara inteira.
      style={{ maskImage: `url("${source}")`, WebkitMaskImage: `url("${source}")` }}
    />
  )
}
