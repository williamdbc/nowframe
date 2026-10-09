interface AmbientIconProps {
  className?: string
  'data-icon'?: string
  source: string
}

export function AmbientIcon({
  className = '',
  source,
  ...dataAttributes
}: AmbientIconProps): React.JSX.Element {
  return (
    <span
      {...dataAttributes}
      aria-hidden="true"
      className={`ambient-icon ${className}`}

      style={{ maskImage: `url("${source}")`, WebkitMaskImage: `url("${source}")` }}
    />
  )
}
