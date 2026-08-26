function normalizeIpcError(error: unknown): Error {
  if (!(error instanceof Error)) return new Error('Não foi possível comunicar com o Spotify.')

  const message = error.message.replace(/^Error invoking remote method '[^']+': (?:Error: )?/, '')
  return new Error(message)
}

export class SpotifyAuthenticationService {
  static getSession(): ReturnType<typeof window.musicDisplay.spotify.getSession> {
    return window.musicDisplay.spotify.getSession()
  }

  static async getProfile(): ReturnType<typeof window.musicDisplay.spotify.getProfile> {
    try {
      return await window.musicDisplay.spotify.getProfile()
    } catch (error) {
      throw normalizeIpcError(error)
    }
  }

  static async login(): ReturnType<typeof window.musicDisplay.spotify.login> {
    try {
      return await window.musicDisplay.spotify.login()
    } catch (error) {
      throw normalizeIpcError(error)
    }
  }

  static async logout(): ReturnType<typeof window.musicDisplay.spotify.logout> {
    try {
      return await window.musicDisplay.spotify.logout()
    } catch (error) {
      throw normalizeIpcError(error)
    }
  }
}
