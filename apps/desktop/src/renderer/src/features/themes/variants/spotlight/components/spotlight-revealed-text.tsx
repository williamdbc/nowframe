const staggerMs = 30

interface SpotlightRevealedTextProps {
  className?: string
  text: string
}

interface RevealUnit {
  delayMs: number
  key: string
  value: string
}

function toRevealUnits(text: string): RevealUnit[] {
  let wordIndex = 0

  return text.split(/(\s+)/).map((value, index) => {
    const isWhitespace = value.trim().length === 0
    const delayMs = isWhitespace ? wordIndex * staggerMs : wordIndex++ * staggerMs

    return { delayMs, key: `${index}-${value}`, value }
  })
}

export function SpotlightRevealedText({
  className = '',
  text
}: SpotlightRevealedTextProps): React.JSX.Element {
  const units = toRevealUnits(text)

  const needsAccessibleCopy = units.length > 1

  return (
    <span className={className}>
      {needsAccessibleCopy && <span className="sr-only">{text}</span>}
      <span aria-hidden={needsAccessibleCopy || undefined}>
        {units.map((unit) => (
          <span
            key={unit.key}
            className="spotlight-reveal-unit"
            style={{ animationDelay: `${unit.delayMs}ms` }}
          >
            {unit.value}
          </span>
        ))}
      </span>
    </span>
  )
}
