import type { ReactNode } from 'react'
import { Check, ChevronDown, Maximize2, Palette } from 'lucide-react'

import { useDismissibleMenu } from '@/shared/hooks/useDismissibleMenu'

interface DisplayToolbarProps {
  accountMenu: ReactNode
  activeThemeName: string
  isEnteringFullScreen: boolean
  onEnterFullScreen: () => void
}

const actionClassName =
  'flex h-11 items-center justify-center gap-2 rounded-full border border-white/10 bg-black/45 px-4 text-sm font-medium text-white/75 shadow-lg backdrop-blur-xl transition hover:border-white/20 hover:bg-black/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'

export function DisplayToolbar({
  accountMenu,
  activeThemeName,
  isEnteringFullScreen,
  onEnterFullScreen
}: DisplayToolbarProps): React.JSX.Element {
  const { closeMenu, containerRef, isOpen, toggleMenu, triggerRef } = useDismissibleMenu()

  return (
    <nav className="fixed top-6 right-6 z-20 flex items-start gap-2" aria-label="Ações do display">
      <div ref={containerRef} className="relative">
        <button
          ref={triggerRef}
          className={`${actionClassName} cursor-pointer list-none`}
          type="button"
          aria-expanded={isOpen}
          aria-haspopup="menu"
          onClick={toggleMenu}
        >
          <Palette aria-hidden="true" className="h-4 w-4" />
          <span>{activeThemeName}</span>
          <ChevronDown
            aria-hidden="true"
            className={`h-3.5 w-3.5 transition ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {isOpen && (
          <div
            className="absolute top-[calc(100%+0.65rem)] right-0 min-w-48 rounded-2xl border border-white/10 bg-[#101211]/95 p-2 shadow-2xl backdrop-blur-2xl"
            role="menu"
            aria-label="Temas"
          >
            <button
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium text-white"
              type="button"
              role="menuitemradio"
              aria-checked="true"
              onClick={closeMenu}
            >
              {activeThemeName}
              <Check aria-hidden="true" className="h-4 w-4 text-[#1ed760]" />
            </button>
          </div>
        )}
      </div>

      {accountMenu}

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
    </nav>
  )
}
