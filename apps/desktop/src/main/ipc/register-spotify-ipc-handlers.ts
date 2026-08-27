import { ipcMain } from 'electron'

import { ipcChannels } from '../../contracts/music-display-api'
import { SpotifyAuthService } from '../spotify/authentication/spotify-auth-service'
import { SpotifyLibraryService } from '../spotify/library/spotify-library-service'
import { SpotifyPlaybackService } from '../spotify/playback/spotify-playback-service'
import { SpotifyProfileService } from '../spotify/profile/spotify-profile-service'

export function registerSpotifyIpcHandlers(): void {
  ipcMain.handle(ipcChannels.getSpotifySession, () => SpotifyAuthService.getSession())
  ipcMain.handle(ipcChannels.getSpotifyProfile, () => SpotifyProfileService.getCurrentProfile())
  ipcMain.handle(ipcChannels.getSpotifyPlayback, () => SpotifyPlaybackService.getCurrentPlayback())
  ipcMain.handle(ipcChannels.getSpotifyLibraryItemState, (_event, uri: unknown) =>
    SpotifyLibraryService.getItemState(uri)
  )
  ipcMain.handle(ipcChannels.pauseSpotifyPlayback, () => SpotifyPlaybackService.pause())
  ipcMain.handle(ipcChannels.removeSpotifyLibraryItem, (_event, uri: unknown) =>
    SpotifyLibraryService.removeItem(uri)
  )
  ipcMain.handle(ipcChannels.resumeSpotifyPlayback, () => SpotifyPlaybackService.resume())
  ipcMain.handle(ipcChannels.saveSpotifyLibraryItem, (_event, uri: unknown) =>
    SpotifyLibraryService.saveItem(uri)
  )
  ipcMain.handle(ipcChannels.seekSpotifyPlayback, (_event, positionMs: unknown) =>
    SpotifyPlaybackService.seek(positionMs)
  )
  ipcMain.handle(ipcChannels.setSpotifyPlaybackVolume, (_event, volumePercent: unknown) =>
    SpotifyPlaybackService.setVolume(volumePercent)
  )
  ipcMain.handle(ipcChannels.setSpotifyPlaybackRepeatMode, (_event, repeatMode: unknown) =>
    SpotifyPlaybackService.setRepeatMode(repeatMode)
  )
  ipcMain.handle(ipcChannels.setSpotifyPlaybackShuffle, (_event, enabled: unknown) =>
    SpotifyPlaybackService.setShuffle(enabled)
  )
  ipcMain.handle(ipcChannels.skipSpotifyPlaybackToNext, () => SpotifyPlaybackService.skipToNext())
  ipcMain.handle(ipcChannels.skipSpotifyPlaybackToPrevious, () =>
    SpotifyPlaybackService.skipToPrevious()
  )
  ipcMain.handle(ipcChannels.loginWithSpotify, () => SpotifyAuthService.login())
  ipcMain.handle(ipcChannels.logoutFromSpotify, () => SpotifyAuthService.logout())
}
