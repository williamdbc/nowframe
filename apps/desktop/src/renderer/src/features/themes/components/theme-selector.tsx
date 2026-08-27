import { Check, ChevronDown, Palette } from 'lucide-react'

import { useDismissibleMenu } from '@/shared/hooks/useDismissibleMenu'

import type { PlayerTheme, PlayerThemeId } from '../types/player-theme'

interface ThemeSelectorProps {
  activeThemeId: PlayerThemeId
  menuAlign?: 'start' | 'end'
  onSelectTheme: (themeId: PlayerThemeId) => void
  themes: readonly PlayerTheme[]
}

const triggerClassName =
  'flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-white/10 bg-black/45 px-4 text-sm font-medium text-white/75 shadow-lg backdrop-blur-xl transition hover:border-white/20 hover:bg-black/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'

export function ThemeSelector({
  activeThemeId,
  menuAlign = 'end',
  onSelectTheme,
  themes
}: ThemeSelectorProps): React.JSX.Element {
  const activeTheme = themes.find((theme) => theme.id === activeThemeId) ?? themes[0]
  const { closeMenu, containerRef, isOpen, toggleMenu, triggerRef } = useDismissibleMenu()

  const selectTheme = (themeId: PlayerThemeId): void => {
    onSelectTheme(themeId)
    closeMenu()
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        className={triggerClassName}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={toggleMenu}
      >
        <Palette aria-hidden="true" className="h-4 w-4" />
        <span>{activeTheme?.name ?? 'Tema'}</span>
        <ChevronDown
          aria-hidden="true"
          className={`h-3.5 w-3.5 transition ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute top-[calc(100%+0.65rem)] min-w-52 rounded-2xl border border-white/10 bg-[#101211]/95 p-2 shadow-2xl backdrop-blur-2xl ${menuAlign === 'start' ? 'left-0' : 'right-0'}`}
          role="menu"
          aria-label="Temas"
        >
          {themes.map((theme) => {
            const isActive = theme.id === activeThemeId
            return (
              <button
                key={theme.id}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium text-white transition hover:bg-white/[0.07] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white"
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                onClick={() => selectTheme(theme.id)}
              >
                {theme.name}
                {isActive && <Check aria-hidden="true" className="h-4 w-4 text-[#1ed760]" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
