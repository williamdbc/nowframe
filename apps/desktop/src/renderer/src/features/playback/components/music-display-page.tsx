import { AppBootstrapErrorState } from '@/features/app-bootstrap/components/app-bootstrap-error-state'
import { AppBootstrapLoadingState } from '@/features/app-bootstrap/components/app-bootstrap-loading-state'
import { SpotifyConfigurationStatus } from '@/features/app-bootstrap/components/spotify-configuration-status'
import { useGetAppBootstrapQuery } from '@/features/app-bootstrap/hooks/useGetAppBootstrapQuery'
import { themeRegistry } from '@/features/themes/theme-registry'
import { FullscreenHint } from '@/features/window-controls/components/fullscreen-hint'
import { useWindowPresentationMode } from '@/features/window-controls/hooks/useWindowPresentationMode'

import { DisplayToolbar } from './display-toolbar'

export function MusicDisplayPage(): React.JSX.Element {
  const bootstrapQuery = useGetAppBootstrapQuery()
  const ActiveTheme = themeRegistry.default.component
  const presentationMode = useWindowPresentationMode()

  if (bootstrapQuery.isPending) {
    return <AppBootstrapLoadingState />
  }

  if (bootstrapQuery.isError) {
    return <AppBootstrapErrorState onRetry={() => void bootstrapQuery.refetch()} />
  }

  return (
    <>
      {!presentationMode.isFullScreen && (
        <>
          <div className="fixed top-6 left-6 z-20">
            <SpotifyConfigurationStatus isConfigured={bootstrapQuery.data.spotify.isConfigured} />
          </div>
          <DisplayToolbar
            activeThemeName={themeRegistry.default.name}
            isEnteringFullScreen={presentationMode.isTransitioning}
            onEnterFullScreen={presentationMode.enterFullScreen}
          />
        </>
      )}
      <FullscreenHint isFullScreen={presentationMode.isFullScreen} />
      <ActiveTheme playback={null} />
    </>
  )
}
