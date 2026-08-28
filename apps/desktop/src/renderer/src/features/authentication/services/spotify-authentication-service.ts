import { normalizeIpcError } from '@/shared/utils/normalize-ipc-error'

export class SpotifyAuthenticationService {
  static getSession(): ReturnType<typeof window.nowframe.spotify.getSession> {
    return window.nowframe.spotify.getSession()
  }

  static async getProfile(): ReturnType<typeof window.nowframe.spotify.getProfile> {
    try {
      return await window.nowframe.spotify.getProfile()
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível carregar o perfil do Spotify.')
    }
  }

  static async login(): ReturnType<typeof window.nowframe.spotify.login> {
    try {
      return await window.nowframe.spotify.login()
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível conectar com o Spotify.')
    }
  }

  static async logout(): ReturnType<typeof window.nowframe.spotify.logout> {
    try {
      return await window.nowframe.spotify.logout()
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível desconectar do Spotify.')
    }
  }
}
