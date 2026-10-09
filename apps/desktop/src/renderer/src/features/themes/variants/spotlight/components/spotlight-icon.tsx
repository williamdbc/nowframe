interface SpotlightIconProps {
  className?: string
  'data-icon'?: string
  source: string
}

export function SpotlightIcon({
  className = '',
  source,
  ...dataAttributes
}: SpotlightIconProps): React.JSX.Element {
  return (
    <span
      {...dataAttributes}
      aria-hidden="true"
      className={`spotlight-icon ${className}`}

      style={{ maskImage: `url("${source}")`, WebkitMaskImage: `url("${source}")` }}
    />
  )
}
