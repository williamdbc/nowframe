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

  static async playContextTrack(
    contextUri: string,
    position: number
  ): ReturnType<typeof window.musicDisplay.spotify.playContextTrack> {
    try {
      return await window.musicDisplay.spotify.playContextTrack(contextUri, position)
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível reproduzir esta faixa.')
    }
  }

  static async resume(): ReturnType<typeof window.musicDisplay.spotify.resumePlayback> {
    try {
      return await window.musicDisplay.spotify.resumePlayback()
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível retomar a reprodução do Spotify.')
    }
  }

  static async seek(
    positionMs: number
  ): ReturnType<typeof window.musicDisplay.spotify.seekPlayback> {
    try {
      return await window.musicDisplay.spotify.seekPlayback(positionMs)
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível alterar a posição da reprodução.')
    }
  }

  static async setVolume(
    volumePercent: number
  ): ReturnType<typeof window.musicDisplay.spotify.setPlaybackVolume> {
    try {
      return await window.musicDisplay.spotify.setPlaybackVolume(volumePercent)
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível alterar o volume da reprodução.')
    }
  }

  static async setRepeatMode(
    repeatMode: Parameters<typeof window.musicDisplay.spotify.setPlaybackRepeatMode>[0]
  ): ReturnType<typeof window.musicDisplay.spotify.setPlaybackRepeatMode> {
    try {
      return await window.musicDisplay.spotify.setPlaybackRepeatMode(repeatMode)
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível alterar o modo de repetição.')
    }
  }

  static async setShuffle(
    enabled: boolean
  ): ReturnType<typeof window.musicDisplay.spotify.setPlaybackShuffle> {
    try {
      return await window.musicDisplay.spotify.setPlaybackShuffle(enabled)
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível alterar o modo aleatório.')
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
