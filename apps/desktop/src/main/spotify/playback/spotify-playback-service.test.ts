import { afterEach, describe, expect, it, vi } from 'vitest'

import { SpotifyAuthService } from '../authentication/spotify-auth-service'
import { SpotifyPlaybackClient } from './spotify-playback-client'
import { SpotifyPlaybackService } from './spotify-playback-service'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('SpotifyPlaybackService', () => {
  it('validates and forwards playback settings with the current access token', async () => {
    vi.spyOn(SpotifyAuthService, 'getAccessToken').mockResolvedValue('access-token')
    vi.spyOn(SpotifyPlaybackClient, 'seek').mockResolvedValue(undefined)
    vi.spyOn(SpotifyPlaybackClient, 'setVolume').mockResolvedValue(undefined)
    vi.spyOn(SpotifyPlaybackClient, 'setRepeatMode').mockResolvedValue(undefined)
    vi.spyOn(SpotifyPlaybackClient, 'setShuffle').mockResolvedValue(undefined)

    await SpotifyPlaybackService.seek(75_000)
    await SpotifyPlaybackService.setVolume(42)
    await SpotifyPlaybackService.setRepeatMode('track')
    await SpotifyPlaybackService.setShuffle(true)

    expect(SpotifyPlaybackClient.seek).toHaveBeenCalledWith('access-token', 75_000)
    expect(SpotifyPlaybackClient.setVolume).toHaveBeenCalledWith('access-token', 42)
    expect(SpotifyPlaybackClient.setRepeatMode).toHaveBeenCalledWith('access-token', 'track')
    expect(SpotifyPlaybackClient.setShuffle).toHaveBeenCalledWith('access-token', true)
  })

  it('rejects invalid IPC values before accessing Spotify', async () => {
    const accessTokenSpy = vi.spyOn(SpotifyAuthService, 'getAccessToken')

    await expect(SpotifyPlaybackService.seek(-1)).rejects.toThrow(
      'A posição da reprodução é inválida.'
    )
    await expect(SpotifyPlaybackService.seek('75000')).rejects.toThrow(
      'A posição da reprodução é inválida.'
    )
    await expect(SpotifyPlaybackService.setVolume(101)).rejects.toThrow(
      'O volume deve ser um número inteiro entre 0 e 100.'
    )
    await expect(SpotifyPlaybackService.setVolume(42.5)).rejects.toThrow(
      'O volume deve ser um número inteiro entre 0 e 100.'
    )
    await expect(SpotifyPlaybackService.setRepeatMode('all')).rejects.toThrow(
      'O modo de repetição é inválido.'
    )
    await expect(SpotifyPlaybackService.setShuffle('true')).rejects.toThrow(
      'O modo aleatório é inválido.'
    )
    expect(accessTokenSpy).not.toHaveBeenCalled()
  })
})
