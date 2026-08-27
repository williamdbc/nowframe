import { normalizeIpcError } from '@/shared/utils/normalize-ipc-error'

export class SpotifyAuthenticationService {
  static getSession(): ReturnType<typeof window.musicDisplay.spotify.getSession> {
    return window.musicDisplay.spotify.getSession()
  }

  static async getProfile(): ReturnType<typeof window.musicDisplay.spotify.getProfile> {
    try {
      return await window.musicDisplay.spotify.getProfile()
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível carregar o perfil do Spotify.')
    }
  }

  static async login(): ReturnType<typeof window.musicDisplay.spotify.login> {
    try {
      return await window.musicDisplay.spotify.login()
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível conectar com o Spotify.')
    }
  }

  static async logout(): ReturnType<typeof window.musicDisplay.spotify.logout> {
    try {
      return await window.musicDisplay.spotify.logout()
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível desconectar do Spotify.')
    }
  }
}
