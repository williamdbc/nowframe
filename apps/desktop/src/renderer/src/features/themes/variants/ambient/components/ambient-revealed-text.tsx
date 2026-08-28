/**
 * Spec per-word-crossfade do catálogo animate-text: as palavras entram uma após
 * a outra com um deslocamento vertical curto, em cadência calma e legível.
 */
const staggerMs = 70

interface AmbientRevealedTextProps {
  className?: string
  text: string
}

interface RevealUnit {
  delayMs: number
  key: string
  value: string
}

/**
 * O split preserva os espaços para não colapsar a frase, mas só as palavras
 * contam para o stagger: senão a cadência sairia com o dobro do intervalo.
 */
function toRevealUnits(text: string): RevealUnit[] {
  let wordIndex = 0

  return text.split(/(\s+)/).map((value, index) => {
    const isWhitespace = value.trim().length === 0
    const delayMs = isWhitespace ? wordIndex * staggerMs : wordIndex++ * staggerMs

    return { delayMs, key: `${index}-${value}`, value }
  })
}

export function AmbientRevealedText({
  className = '',
  text
}: AmbientRevealedTextProps): React.JSX.Element {
  const units = toRevealUnits(text)
  // Uma frase quebrada em palavras não é legível como texto único, então o texto
  // inteiro vai num nó exclusivo para leitores de tela. Com uma palavra só esse
  // nó seria um duplicata exata do span animado, e aí o próprio span já serve.
  const needsAccessibleCopy = units.length > 1

  return (
    <span className={className}>
      {needsAccessibleCopy && <span className="sr-only">{text}</span>}
      <span aria-hidden={needsAccessibleCopy || undefined}>
        {units.map((unit) => (
          <span
            key={unit.key}
            className="ambient-reveal-unit"
            style={{ animationDelay: `${unit.delayMs}ms` }}
          >
            {unit.value}
          </span>
        ))}
      </span>
    </span>
  )
}
