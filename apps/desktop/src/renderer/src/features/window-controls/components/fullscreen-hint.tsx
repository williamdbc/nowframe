interface FullscreenHintProps {
  isFullScreen: boolean
}

export function FullscreenHint({ isFullScreen }: FullscreenHintProps): React.JSX.Element | null {
  if (!isFullScreen) return null

  return (
    <div
      className="fullscreen-hint fixed bottom-8 left-1/2 z-30 -translate-x-1/2 rounded-full border border-white/10 bg-black/70 px-5 py-2.5 text-sm font-medium text-white/75 shadow-2xl backdrop-blur-xl"
      role="status"
      aria-live="polite"
    >
      Pressione ESC para sair da tela cheia
    </div>
  )
}
