interface VinylIconProps {
  className?: string
  'data-icon'?: string
  source: string
}

export function VinylIcon({
  className = '',
  source,
  ...dataAttributes
}: VinylIconProps): React.JSX.Element {
  return (
    <span
      {...dataAttributes}
      aria-hidden="true"
      className={`vinyl-icon ${className}`}

      style={{ maskImage: `url("${source}")`, WebkitMaskImage: `url("${source}")` }}
    />
  )
}
