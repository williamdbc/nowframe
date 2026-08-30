import { useNavigate } from '@tanstack/react-router'

import { AppBootstrapErrorState } from '@/features/app-bootstrap/components/app-bootstrap-error-state'
import { AppBootstrapLoadingState } from '@/features/app-bootstrap/components/app-bootstrap-loading-state'
import { useGetAppBootstrapQuery } from '@/features/app-bootstrap/hooks/useGetAppBootstrapQuery'
import { useGetSpotifyAlbumTracksQuery } from '@/features/albums/hooks/useGetSpotifyAlbumTracksQuery'
import { SpotifyConnectionStatus } from '@/features/authentication/components/spotify-connection-status'
import { SpotifyProfileMenu } from '@/features/authentication/components/spotify-profile-menu'
import { useGetSpotifyProfileQuery } from '@/features/authentication/hooks/useGetSpotifyProfileQuery'
import { useLogoutFromSpotifyMutation } from '@/features/authentication/hooks/useLogoutFromSpotifyMutation'
import { useGetSpotifyLibraryItemQuery } from '@/features/library/hooks/useGetSpotifyLibraryItemQuery'
import { useToggleSpotifyLibraryItemMutation } from '@/features/library/hooks/useToggleSpotifyLibraryItemMutation'
import { useGetLyricsQuery } from '@/features/lyrics/hooks/useGetLyricsQuery'
import { useLyricsDisplayState } from '@/features/lyrics/hooks/useLyricsDisplayState'
import { useGetSpotifyPlaylistTracksQuery } from '@/features/playlists/hooks/useGetSpotifyPlaylistTracksQuery'
import { ThemeSelector } from '@/features/themes/core/components/theme-selector'
import { useSelectedTheme } from '@/features/themes/core/hooks/useSelectedTheme'
import { availableThemes } from '@/features/themes/core/theme-registry'
import { FullscreenControl } from '@/features/window-controls/components/fullscreen-control'
import { FullscreenHint } from '@/features/window-controls/components/fullscreen-hint'
import { useWindowPresentationMode } from '@/features/window-controls/hooks/useWindowPresentationMode'

import { useControlSpotifyPlaybackMutation } from '../hooks/useControlSpotifyPlaybackMutation'
import { useGetSpotifyPlaybackQuery } from '../hooks/useGetSpotifyPlaybackQuery'
import { useGetSpotifyPlaybackQueueQuery } from '../hooks/useGetSpotifyPlaybackQueueQuery'
import { useSyncPlaybackClock } from '../hooks/useSyncPlaybackClock'
import { getPlaybackContentKey } from '../utils/get-playback-content-key'
import { usePlaybackVolumeControl } from '../hooks/usePlaybackVolumeControl'
import { usePlaySpotifyContextTrackMutation } from '../hooks/usePlaySpotifyContextTrackMutation'
import { useSeekSpotifyPlaybackMutation } from '../hooks/useSeekSpotifyPlaybackMutation'
import { useSetSpotifyPlaybackOptionMutation } from '../hooks/useSetSpotifyPlaybackOptionMutation'
import type { PlaybackLoadStatus } from '../types/playback-state'
import { getNextRepeatMode } from '../utils/get-next-repeat-mode'

export function PlaybackDisplayPage(): React.JSX.Element {
  const bootstrapQuery = useGetAppBootstrapQuery()
  const profileQuery = useGetSpotifyProfileQuery()
  const playbackQuery = useGetSpotifyPlaybackQuery()
  const playbackControlMutation = useControlSpotifyPlaybackMutation()
  const playContextTrackMutation = usePlaySpotifyContextTrackMutation()
  const playbackOptionMutation = useSetSpotifyPlaybackOptionMutation()
  const seekMutation = useSeekSpotifyPlaybackMutation()
  const logoutMutation = useLogoutFromSpotifyMutation()
  const navigate = useNavigate()
  const selectedTheme = useSelectedTheme()
  const ActiveTheme = selectedTheme.activeTheme.component
  const presentationMode = useWindowPresentationMode()
  const playback = playbackQuery.data ?? null

  // A posição viva sai do relógio compartilhado, não de um tick que re-renderiza a página.
  useSyncPlaybackClock(playback)

  // Esta query de fila ainda é aquecida por identidade de conteúdo, mas não participa
  // mais da troca de metadados. A arquitetura registra sua remoção como dívida técnica.
  useGetSpotifyPlaybackQueueQuery(getPlaybackContentKey(playback))

  const shouldLoadTracklist = selectedTheme.activeTheme.usesTracklist === true
  const shouldLoadLyrics =
    selectedTheme.activeThemeId === 'lyrics' ||
    selectedTheme.activeThemeId === 'karaoke' ||
    selectedTheme.activeThemeId === 'ambient'
  const lyricsQueryInput =
    playback?.item?.type === 'track' && playback.item.creatorNames[0]
      ? {
          albumName: playback.item.collectionName,
          artistName: playback.item.creatorNames[0],
          durationMs: playback.item.durationMs,
          trackName: playback.item.title
        }
      : null
  const lyricsQuery = useGetLyricsQuery(lyricsQueryInput, shouldLoadLyrics)
  const lyrics = useLyricsDisplayState(lyricsQuery, shouldLoadLyrics && Boolean(lyricsQueryInput))
  const playbackContext =
    playback?.context ??
    (playback?.item?.album
      ? {
          id: playback.item.album.id,
          type: 'album' as const,
          uri: playback.item.album.uri
        }
      : null)
  const albumTracksQuery = useGetSpotifyAlbumTracksQuery(
    playbackContext?.type === 'album' ? playbackContext.id : null,
    shouldLoadTracklist && playbackContext?.type === 'album'
  )
  const playlistTracksQuery = useGetSpotifyPlaylistTracksQuery(
    playbackContext?.type === 'playlist' ? playbackContext.id : null,
    shouldLoadTracklist && playbackContext?.type === 'playlist'
  )
  const activeTracklistQuery =
    playbackContext?.type === 'playlist' ? playlistTracksQuery : albumTracksQuery
  const activeTracklist = activeTracklistQuery.data
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
  const chrome = {
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
    connectionStatus: presentationMode.isFullScreen ? null : <SpotifyConnectionStatus />,
    fullscreenControl: presentationMode.isFullScreen ? null : (
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
        isFullScreen={presentationMode.isFullScreen}
        onExitFullScreen={presentationMode.exitFullScreen}
        controls={{
          canToggleSaved: Boolean(libraryItemUri && libraryItemQuery.data),
          errorMessage:
            playContextTrackMutation.error?.message ??
            (shouldLoadTracklist ? activeTracklistQuery.error?.message : null) ??
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
        lyrics={lyrics}
        playback={playback}
        playbackStatus={playbackStatus}
        tracklist={{
          contextImageUrl:
            playbackContext?.type === 'playlist' && playlistTracksQuery.data
              ? playlistTracksQuery.data.imageUrl
              : (playback?.item?.imageUrl ?? null),
          contextName:
            playbackContext?.type === 'playlist' && playlistTracksQuery.data
              ? playlistTracksQuery.data.name
              : (playback?.item?.collectionName ?? 'conteúdo atual'),
          isPending: Boolean(playbackContext) && activeTracklistQuery.isPending,
          isPlayPending: playContextTrackMutation.isPending,
          onPlayTrack: (track) => {
            if (!playbackContext) return
            playContextTrackMutation.mutate({ contextUri: playbackContext.uri, track })
          },
          tracks: activeTracklist?.tracks ?? []
        }}
      />
    </>
  )
}
