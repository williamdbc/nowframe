import { Minimize2 } from 'lucide-react'

interface FullscreenExitControlProps {
  className?: string
  onExitFullScreen: () => void
}

const defaultClassName =
  'flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white/75 shadow-lg backdrop-blur-xl transition hover:border-white/20 hover:bg-black/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'

export function FullscreenExitControl({
  className = defaultClassName,
  onExitFullScreen
}: FullscreenExitControlProps): React.JSX.Element {
  return (
    <button
      className={className}
      type="button"
      aria-label="Sair da tela cheia"
      title="Sair da tela cheia"
      onClick={onExitFullScreen}
    >
      <Minimize2 aria-hidden="true" className="h-4 w-4" />
    </button>
  )
}
