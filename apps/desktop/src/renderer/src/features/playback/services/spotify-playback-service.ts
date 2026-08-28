import { normalizeIpcError } from '@/shared/utils/normalize-ipc-error'

export class SpotifyPlaybackService {
  static async getCurrentPlayback(): ReturnType<typeof window.nowframe.spotify.getPlayback> {
    try {
      return await window.nowframe.spotify.getPlayback()
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível sincronizar a reprodução do Spotify.')
    }
  }

  static async getQueue(): ReturnType<typeof window.nowframe.spotify.getPlaybackQueue> {
    try {
      return await window.nowframe.spotify.getPlaybackQueue()
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível consultar a fila de reprodução.')
    }
  }

  static async pause(): ReturnType<typeof window.nowframe.spotify.pausePlayback> {
    try {
      return await window.nowframe.spotify.pausePlayback()
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível pausar a reprodução do Spotify.')
    }
  }

  static async playContextTrack(
    contextUri: string,
    position: number
  ): ReturnType<typeof window.nowframe.spotify.playContextTrack> {
    try {
      return await window.nowframe.spotify.playContextTrack(contextUri, position)
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível reproduzir esta faixa.')
    }
  }

  static async resume(): ReturnType<typeof window.nowframe.spotify.resumePlayback> {
    try {
      return await window.nowframe.spotify.resumePlayback()
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível retomar a reprodução do Spotify.')
    }
  }

  static async seek(positionMs: number): ReturnType<typeof window.nowframe.spotify.seekPlayback> {
    try {
      return await window.nowframe.spotify.seekPlayback(positionMs)
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível alterar a posição da reprodução.')
    }
  }

  static async setVolume(
    volumePercent: number
  ): ReturnType<typeof window.nowframe.spotify.setPlaybackVolume> {
    try {
      return await window.nowframe.spotify.setPlaybackVolume(volumePercent)
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível alterar o volume da reprodução.')
    }
  }

  static async setRepeatMode(
    repeatMode: Parameters<typeof window.nowframe.spotify.setPlaybackRepeatMode>[0]
  ): ReturnType<typeof window.nowframe.spotify.setPlaybackRepeatMode> {
    try {
      return await window.nowframe.spotify.setPlaybackRepeatMode(repeatMode)
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível alterar o modo de repetição.')
    }
  }

  static async setShuffle(
    enabled: boolean
  ): ReturnType<typeof window.nowframe.spotify.setPlaybackShuffle> {
    try {
      return await window.nowframe.spotify.setPlaybackShuffle(enabled)
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível alterar o modo aleatório.')
    }
  }

  static async skipToNext(): ReturnType<typeof window.nowframe.spotify.skipPlaybackToNext> {
    try {
      return await window.nowframe.spotify.skipPlaybackToNext()
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível avançar para o próximo conteúdo.')
    }
  }

  static async skipToPrevious(): ReturnType<typeof window.nowframe.spotify.skipPlaybackToPrevious> {
    try {
      return await window.nowframe.spotify.skipPlaybackToPrevious()
    } catch (error) {
      throw normalizeIpcError(error, 'Não foi possível voltar para o conteúdo anterior.')
    }
  }
}
