import { Maximize2 } from 'lucide-react'

interface FullscreenControlProps {
  isEnteringFullScreen: boolean
  onEnterFullScreen: () => void
}

export function FullscreenControl({
  isEnteringFullScreen,
  onEnterFullScreen
}: FullscreenControlProps): React.JSX.Element {
  return (
    <button
      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white/75 shadow-lg backdrop-blur-xl transition hover:border-white/20 hover:bg-black/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-wait disabled:opacity-50"
      type="button"
      aria-label="Entrar em tela cheia"
      title="Entrar em tela cheia"
      disabled={isEnteringFullScreen}
      onClick={onEnterFullScreen}
    >
      <Maximize2 aria-hidden="true" className="h-4 w-4" />
    </button>
  )
}
