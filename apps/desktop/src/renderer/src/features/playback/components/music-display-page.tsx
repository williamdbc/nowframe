import { useNavigate } from '@tanstack/react-router'

import { AppBootstrapErrorState } from '@/features/app-bootstrap/components/app-bootstrap-error-state'
import { AppBootstrapLoadingState } from '@/features/app-bootstrap/components/app-bootstrap-loading-state'
import { useGetAppBootstrapQuery } from '@/features/app-bootstrap/hooks/useGetAppBootstrapQuery'
import { SpotifyConnectionStatus } from '@/features/authentication/components/spotify-connection-status'
import { SpotifyProfileMenu } from '@/features/authentication/components/spotify-profile-menu'
import { useGetSpotifyProfileQuery } from '@/features/authentication/hooks/useGetSpotifyProfileQuery'
import { useLogoutFromSpotifyMutation } from '@/features/authentication/hooks/useLogoutFromSpotifyMutation'
import { useGetSpotifyLibraryItemQuery } from '@/features/library/hooks/useGetSpotifyLibraryItemQuery'
import { useToggleSpotifyLibraryItemMutation } from '@/features/library/hooks/useToggleSpotifyLibraryItemMutation'
import { ThemeSelector } from '@/features/themes/components/theme-selector'
import { useSelectedTheme } from '@/features/themes/hooks/useSelectedTheme'
import { availableThemes } from '@/features/themes/theme-registry'
import { FullscreenControl } from '@/features/window-controls/components/fullscreen-control'
import { FullscreenHint } from '@/features/window-controls/components/fullscreen-hint'
import { useWindowPresentationMode } from '@/features/window-controls/hooks/useWindowPresentationMode'

import { useControlSpotifyPlaybackMutation } from '../hooks/useControlSpotifyPlaybackMutation'
import { useGetSpotifyPlaybackQuery } from '../hooks/useGetSpotifyPlaybackQuery'
import { useLivePlaybackState } from '../hooks/useLivePlaybackState'
import { usePlaybackVolumeControl } from '../hooks/usePlaybackVolumeControl'
import { useSeekSpotifyPlaybackMutation } from '../hooks/useSeekSpotifyPlaybackMutation'
import { useSetSpotifyPlaybackOptionMutation } from '../hooks/useSetSpotifyPlaybackOptionMutation'
import type { PlaybackLoadStatus } from '../types/playback-state'
import { getNextRepeatMode } from '../utils/get-next-repeat-mode'

export function MusicDisplayPage(): React.JSX.Element {
  const bootstrapQuery = useGetAppBootstrapQuery()
  const profileQuery = useGetSpotifyProfileQuery()
  const playbackQuery = useGetSpotifyPlaybackQuery()
  const playbackControlMutation = useControlSpotifyPlaybackMutation()
  const playbackOptionMutation = useSetSpotifyPlaybackOptionMutation()
  const seekMutation = useSeekSpotifyPlaybackMutation()
  const logoutMutation = useLogoutFromSpotifyMutation()
  const navigate = useNavigate()
  const selectedTheme = useSelectedTheme()
  const ActiveTheme = selectedTheme.activeTheme.component
  const presentationMode = useWindowPresentationMode()
  const playback = useLivePlaybackState(playbackQuery.data ?? null)
  const volumeControl = usePlaybackVolumeControl(playback)
  const libraryItemUri = playback?.item?.uri?.startsWith(`spotify:${playback.item.type}:`)
    ? playback.item.uri
    : null
  const libraryItemQuery = useGetSpotifyLibraryItemQuery(libraryItemUri)
  const toggleLibraryItemMutation = useToggleSpotifyLibraryItemMutation()

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

  const playbackStatus: PlaybackLoadStatus =
    playbackQuery.data !== undefined ? 'ready' : playbackQuery.isError ? 'error' : 'loading'
  const chrome = presentationMode.isFullScreen
    ? {
        accountMenu: null,
        connectionStatus: null,
        fullscreenControl: null,
        themeSelector: null
      }
    : {
        accountMenu: (
          <SpotifyProfileMenu
            profile={profileQuery.data ?? null}
            isLoading={profileQuery.isPending}
            isError={profileQuery.isError}
            isLoggingOut={logoutMutation.isPending}
            onRetry={() => void profileQuery.refetch()}
            onLogout={logoutFromSpotify}
          />
        ),
        connectionStatus: <SpotifyConnectionStatus />,
        fullscreenControl: (
          <FullscreenControl
            isEnteringFullScreen={presentationMode.isTransitioning}
            onEnterFullScreen={presentationMode.enterFullScreen}
          />
        ),
        themeSelector: (
          <ThemeSelector
            activeThemeId={selectedTheme.activeThemeId}
            onSelectTheme={selectedTheme.selectTheme}
            themes={availableThemes}
          />
        )
      }

  return (
    <>
      <FullscreenHint isFullScreen={presentationMode.isFullScreen} />
      <ActiveTheme
        chrome={chrome}
        controls={{
          canToggleSaved: Boolean(libraryItemUri && libraryItemQuery.data),
          errorMessage:
            playbackControlMutation.error?.message ??
            playbackOptionMutation.error?.message ??
            seekMutation.error?.message ??
            volumeControl.error?.message ??
            toggleLibraryItemMutation.error?.message ??
            libraryItemQuery.error?.message ??
            null,
          isCommandPending: playbackControlMutation.isPending,
          isLibraryPending:
            Boolean(libraryItemUri && libraryItemQuery.isPending) ||
            toggleLibraryItemMutation.isPending,
          isPlaybackOptionPending: playbackOptionMutation.isPending,
          isSaved: libraryItemQuery.data?.isSaved ?? false,
          isSeekPending: seekMutation.isPending,
          isVolumePending: volumeControl.isPending,
          onCycleRepeat: () => {
            if (!playback) return
            playbackOptionMutation.mutate({
              repeatMode: getNextRepeatMode(playback.repeatMode),
              type: 'repeat'
            })
          },
          onNext: () => playbackControlMutation.mutate('next'),
          onPauseOrResume: () =>
            playbackControlMutation.mutate(playback?.isPlaying ? 'pause' : 'resume'),
          onPrevious: () => playbackControlMutation.mutate('previous'),
          onSeek: (positionMs) => seekMutation.mutate(Math.round(positionMs)),
          onCommitVolume: volumeControl.commitVolume,
          onSetVolume: volumeControl.setVolume,
          onToggleSaved: () => {
            if (!libraryItemUri || !libraryItemQuery.data) return
            toggleLibraryItemMutation.mutate({
              shouldSave: !libraryItemQuery.data.isSaved,
              uri: libraryItemUri
            })
          },
          onToggleShuffle: () => {
            if (!playback) return
            playbackOptionMutation.mutate({
              enabled: !playback.shuffleEnabled,
              type: 'shuffle'
            })
          },
          onToggleMute: volumeControl.toggleMute
        }}
        playback={playback}
        playbackStatus={playbackStatus}
      />
    </>
  )
}
