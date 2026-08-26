import { useNavigate } from '@tanstack/react-router'

import { AppBootstrapErrorState } from '@/features/app-bootstrap/components/app-bootstrap-error-state'
import { AppBootstrapLoadingState } from '@/features/app-bootstrap/components/app-bootstrap-loading-state'
import { useGetAppBootstrapQuery } from '@/features/app-bootstrap/hooks/useGetAppBootstrapQuery'
import { SpotifyConnectionStatus } from '@/features/authentication/components/spotify-connection-status'
import { SpotifyProfileMenu } from '@/features/authentication/components/spotify-profile-menu'
import { useGetSpotifyProfileQuery } from '@/features/authentication/hooks/useGetSpotifyProfileQuery'
import { useLogoutFromSpotifyMutation } from '@/features/authentication/hooks/useLogoutFromSpotifyMutation'
import { themeRegistry } from '@/features/themes/theme-registry'
import { FullscreenHint } from '@/features/window-controls/components/fullscreen-hint'
import { useWindowPresentationMode } from '@/features/window-controls/hooks/useWindowPresentationMode'

import { DisplayToolbar } from './display-toolbar'

export function MusicDisplayPage(): React.JSX.Element {
  const bootstrapQuery = useGetAppBootstrapQuery()
  const profileQuery = useGetSpotifyProfileQuery()
  const logoutMutation = useLogoutFromSpotifyMutation()
  const navigate = useNavigate()
  const ActiveTheme = themeRegistry.default.component
  const presentationMode = useWindowPresentationMode()

  if (bootstrapQuery.isPending) {
    return <AppBootstrapLoadingState />
  }

  if (bootstrapQuery.isError) {
    return <AppBootstrapErrorState onRetry={() => void bootstrapQuery.refetch()} />
  }

  const logoutFromSpotify = (): void => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => void navigate({ to: '/login' })
    })
  }

  return (
    <>
      {!presentationMode.isFullScreen && (
        <>
          <div className="fixed top-6 left-6 z-20">
            <SpotifyConnectionStatus />
          </div>
          <DisplayToolbar
            accountMenu={
              <SpotifyProfileMenu
                profile={profileQuery.data ?? null}
                isLoading={profileQuery.isPending}
                isError={profileQuery.isError}
                isLoggingOut={logoutMutation.isPending}
                onRetry={() => void profileQuery.refetch()}
                onLogout={logoutFromSpotify}
              />
            }
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
