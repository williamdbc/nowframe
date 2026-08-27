import { normalizeIpcError } from '@/shared/utils/normalize-ipc-error'

export class SpotifyPlaybackService {
  static async getCurrentPlayback(): ReturnType<typeof window.musicDisplay.spotify.getPlayback> {
    try {
      return await window.musicDisplay.spotify.getPlayback()
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível sincronizar a reprodução do Spotify.')
    }
  }

  static async pause(): ReturnType<typeof window.musicDisplay.spotify.pausePlayback> {
    try {
      return await window.musicDisplay.spotify.pausePlayback()
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível pausar a reprodução do Spotify.')
    }
  }

  static async resume(): ReturnType<typeof window.musicDisplay.spotify.resumePlayback> {
    try {
      return await window.musicDisplay.spotify.resumePlayback()
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível retomar a reprodução do Spotify.')
    }
  }

  static async skipToNext(): ReturnType<typeof window.musicDisplay.spotify.skipPlaybackToNext> {
    try {
      return await window.musicDisplay.spotify.skipPlaybackToNext()
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível avançar para o próximo conteúdo.')
    }
  }

  static async skipToPrevious(): ReturnType<
    typeof window.musicDisplay.spotify.skipPlaybackToPrevious
  > {
    try {
      return await window.musicDisplay.spotify.skipPlaybackToPrevious()
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível voltar para o conteúdo anterior.')
    }
  }
}
