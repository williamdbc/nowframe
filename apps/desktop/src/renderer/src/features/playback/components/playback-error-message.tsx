import { useEffect, useState } from 'react'

interface PlaybackErrorMessageProps {
  className?: string
  durationMs?: number
  message: string
}

const defaultDurationMs = 10_000

export function PlaybackErrorMessage({
  className,
  durationMs = defaultDurationMs,
  message
}: PlaybackErrorMessageProps): React.JSX.Element | null {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setIsVisible(false), durationMs)

    return () => window.clearTimeout(timeoutId)
  }, [durationMs])

  if (!isVisible) return null

  return (
    <p className={className} role="alert">
      {message}
    </p>
  )
}
