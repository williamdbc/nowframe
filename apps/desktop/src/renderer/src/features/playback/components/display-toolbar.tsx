import { Check, ChevronDown, Ellipsis, LogOut, Maximize2, Palette, UserRound } from 'lucide-react'

interface DisplayToolbarProps {
  activeThemeName: string
  isEnteringFullScreen: boolean
  isLoggingOut: boolean
  onEnterFullScreen: () => void
  onLogout: () => void
}

const actionClassName =
  'flex h-11 items-center justify-center gap-2 rounded-full border border-white/10 bg-black/45 px-4 text-sm font-medium text-white/75 shadow-lg backdrop-blur-xl transition hover:border-white/20 hover:bg-black/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'

export function DisplayToolbar({
  activeThemeName,
  isEnteringFullScreen,
  isLoggingOut,
  onEnterFullScreen,
  onLogout
}: DisplayToolbarProps): React.JSX.Element {
  return (
    <nav className="fixed top-6 right-6 z-20 flex items-start gap-2" aria-label="Ações do display">
      <details className="group relative">
        <summary className={`${actionClassName} cursor-pointer list-none`}>
          <Palette aria-hidden="true" className="h-4 w-4" />
          <span>{activeThemeName}</span>
          <ChevronDown
            aria-hidden="true"
            className="h-3.5 w-3.5 transition group-open:rotate-180"
          />
        </summary>
        <div className="absolute top-[calc(100%+0.65rem)] right-0 min-w-48 rounded-2xl border border-white/10 bg-[#101211]/95 p-2 shadow-2xl backdrop-blur-2xl">
          <button
            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium text-white"
            type="button"
          >
            {activeThemeName}
            <Check aria-hidden="true" className="h-4 w-4 text-[#1ed760]" />
          </button>
        </div>
      </details>

      <button
        className={`${actionClassName} w-11 px-0 disabled:cursor-wait disabled:opacity-50`}
        type="button"
        aria-label="Entrar em tela cheia"
        title="Entrar em tela cheia"
        disabled={isEnteringFullScreen}
        onClick={onEnterFullScreen}
      >
        <Maximize2 aria-hidden="true" className="h-4 w-4" />
      </button>

      <details className="group relative">
        <summary
          className={`${actionClassName} w-11 cursor-pointer list-none px-0`}
          aria-label="Abrir menu"
          title="Menu"
        >
          <Ellipsis aria-hidden="true" className="h-5 w-5" />
        </summary>
        <div className="absolute top-[calc(100%+0.65rem)] right-0 min-w-60 rounded-2xl border border-white/10 bg-[#101211]/95 p-2 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/78">
            <UserRound aria-hidden="true" className="h-4 w-4" />
            Spotify conectado
          </div>
          <button
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-red-200/75 transition hover:bg-red-400/10 hover:text-red-100 disabled:cursor-wait disabled:opacity-45"
            type="button"
            disabled={isLoggingOut}
            onClick={onLogout}
          >
            <LogOut aria-hidden="true" className="h-4 w-4" />
            {isLoggingOut ? 'Desconectando...' : 'Desconectar Spotify'}
          </button>
        </div>
      </details>
    </nav>
  )
}
