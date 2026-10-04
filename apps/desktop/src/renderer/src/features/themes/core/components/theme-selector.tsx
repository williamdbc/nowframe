import { useEffect, useId, useRef } from 'react'
import { Check, ChevronDown, Palette } from 'lucide-react'

import { useDismissibleMenu } from '@/shared/hooks/useDismissibleMenu'

import type { PlayerTheme, PlayerThemeCategory, PlayerThemeId } from '../types/player-theme'

interface ThemeSelectorProps {
  activeThemeId: PlayerThemeId
  menuAlign?: 'start' | 'end'
  onSelectTheme: (themeId: PlayerThemeId) => void
  themes: readonly PlayerTheme[]
}

const triggerClassName =
  'flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-white/10 bg-black/45 px-4 text-sm font-medium text-white/75 shadow-lg backdrop-blur-xl transition hover:border-white/20 hover:bg-black/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'

const themeSections: ReadonlyArray<{ id: PlayerThemeCategory; label: string }> = [
  { id: 'main', label: 'Principais' },
  { id: 'conceptual', label: 'Conceituais' }
]

export function ThemeSelector({
  activeThemeId,
  menuAlign = 'end',
  onSelectTheme,
  themes
}: ThemeSelectorProps): React.JSX.Element {
  const activeTheme = themes.find((theme) => theme.id === activeThemeId) ?? themes[0]
  const activeThemeButtonRef = useRef<HTMLButtonElement>(null)
  const sectionIdPrefix = useId()
  const { closeMenu, containerRef, isOpen, toggleMenu, triggerRef } = useDismissibleMenu()
  const populatedSections = themeSections
    .map((section) => ({
      ...section,
      themes: themes.filter((theme) => theme.category === section.id)
    }))
    .filter((section) => section.themes.length > 0)

  useEffect(() => {
    if (!isOpen) return

    activeThemeButtonRef.current?.scrollIntoView?.({
      behavior: 'auto',
      block: 'nearest',
      inline: 'nearest'
    })
  }, [activeThemeId, isOpen])

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
        data-demo-theme-selector={activeThemeId}
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
          className={`absolute top-[calc(100%+0.65rem)] z-50 min-w-52 overflow-hidden rounded-2xl border border-white/10 bg-[#101211]/95 shadow-2xl backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-10 before:h-4 before:bg-gradient-to-b before:from-[#101211] before:to-transparent after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:z-10 after:h-4 after:bg-gradient-to-t after:from-[#101211] after:to-transparent ${menuAlign === 'start' ? 'left-0' : 'right-0'}`}
          role="menu"
          aria-label="Temas"
        >
          <div className="max-h-[min(70vh,28rem)] overflow-y-auto overscroll-contain p-2 [scrollbar-color:rgba(255,255,255,0.2)_transparent] [scrollbar-width:thin]">
            {populatedSections.map((section, sectionIndex) => {
              const sectionLabelId = `${sectionIdPrefix}-${section.id}`

              return (
                <div
                  key={section.id}
                  className={sectionIndex > 0 ? 'mt-2 border-t border-white/[0.07] pt-2' : ''}
                  role="group"
                  aria-labelledby={sectionLabelId}
                >
                  <p
                    id={sectionLabelId}
                    className="px-3 pb-1 pt-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/35"
                  >
                    {section.label}
                  </p>

                  {section.themes.map((theme) => {
                    const isActive = theme.id === activeThemeId
                    return (
                      <button
                        key={theme.id}
                        ref={isActive ? activeThemeButtonRef : undefined}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium text-white transition hover:bg-white/[0.07] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white"
                        type="button"
                        role="menuitemradio"
                        aria-checked={isActive}
                        data-demo-theme={theme.id}
                        onClick={() => selectTheme(theme.id)}
                      >
                        {theme.name}
                        {isActive && (
                          <Check aria-hidden="true" className="h-4 w-4 text-[#1ed760]" />
                        )}
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
