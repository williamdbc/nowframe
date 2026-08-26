import { ipcMain } from 'electron'

import { ipcChannels } from '../../contracts/music-display-api'
import { SpotifyAuthService } from '../spotify/authentication/spotify-auth-service'
import { SpotifyProfileService } from '../spotify/profile/spotify-profile-service'

export function registerSpotifyIpcHandlers(): void {
  ipcMain.handle(ipcChannels.getSpotifySession, () => SpotifyAuthService.getSession())
  ipcMain.handle(ipcChannels.getSpotifyProfile, () => SpotifyProfileService.getCurrentProfile())
  ipcMain.handle(ipcChannels.loginWithSpotify, () => SpotifyAuthService.login())
  ipcMain.handle(ipcChannels.logoutFromSpotify, () => SpotifyAuthService.logout())
}
