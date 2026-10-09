interface CdCoverIconProps {
  className?: string
  'data-icon'?: string
  source: string
}

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

      style={{ maskImage: `url("${source}")`, WebkitMaskImage: `url("${source}")` }}
    />
  )
}
