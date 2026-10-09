interface PosterIconProps {
  className?: string
  'data-icon'?: string
  source: string
}

export function PosterIcon({
  className = '',
  source,
  ...dataAttributes
}: PosterIconProps): React.JSX.Element {
  return (
    <span
      {...dataAttributes}
      aria-hidden="true"
      className={`poster-icon ${className}`}

      style={{ maskImage: `url("${source}")`, WebkitMaskImage: `url("${source}")` }}
    />
  )
}
