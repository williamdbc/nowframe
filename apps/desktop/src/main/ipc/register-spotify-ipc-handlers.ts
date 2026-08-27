import { ipcMain } from 'electron'

import { ipcChannels } from '../../contracts/music-display-api'
import { SpotifyAuthService } from '../spotify/authentication/spotify-auth-service'
import { SpotifyPlaybackService } from '../spotify/playback/spotify-playback-service'
import { SpotifyProfileService } from '../spotify/profile/spotify-profile-service'

export function registerSpotifyIpcHandlers(): void {
  ipcMain.handle(ipcChannels.getSpotifySession, () => SpotifyAuthService.getSession())
  ipcMain.handle(ipcChannels.getSpotifyProfile, () => SpotifyProfileService.getCurrentProfile())
  ipcMain.handle(ipcChannels.getSpotifyPlayback, () => SpotifyPlaybackService.getCurrentPlayback())
  ipcMain.handle(ipcChannels.pauseSpotifyPlayback, () => SpotifyPlaybackService.pause())
  ipcMain.handle(ipcChannels.resumeSpotifyPlayback, () => SpotifyPlaybackService.resume())
  ipcMain.handle(ipcChannels.skipSpotifyPlaybackToNext, () => SpotifyPlaybackService.skipToNext())
  ipcMain.handle(ipcChannels.skipSpotifyPlaybackToPrevious, () =>
    SpotifyPlaybackService.skipToPrevious()
  )
  ipcMain.handle(ipcChannels.loginWithSpotify, () => SpotifyAuthService.login())
  ipcMain.handle(ipcChannels.logoutFromSpotify, () => SpotifyAuthService.logout())
}
