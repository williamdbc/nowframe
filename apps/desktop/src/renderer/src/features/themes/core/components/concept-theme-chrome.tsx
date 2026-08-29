import type { PlayerThemeChrome } from '@/features/themes/core/types/player-theme'
import { FullscreenExitControl } from '@/features/window-controls/components/fullscreen-exit-control'

interface ConceptThemeChromeProps {
  chrome: PlayerThemeChrome
  exitClassName?: string
  isFullScreen: boolean
  onExitFullScreen: () => void
}

export function ConceptThemeChrome({
  chrome,
  exitClassName,
  isFullScreen,
  onExitFullScreen
}: ConceptThemeChromeProps): React.JSX.Element {
  return (
    <>
      <div className="player-theme-chrome fixed top-6 left-6 z-30">{chrome.connectionStatus}</div>
      <nav
        className="player-theme-chrome fixed top-6 right-6 z-30 flex items-start gap-2"
        aria-label="Ações do display"
      >
        {chrome.themeSelector}
        {chrome.accountMenu}
        {isFullScreen ? (
          <FullscreenExitControl className={exitClassName} onExitFullScreen={onExitFullScreen} />
        ) : (
          chrome.fullscreenControl
        )}
      </nav>
    </>
  )
}
