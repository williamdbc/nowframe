import { afterEach, describe, expect, it, vi } from 'vitest'

import { SpotifyAuthService } from '../authentication/spotify-auth-service'
import { SpotifyPlaybackClient } from './spotify-playback-client'
import { SpotifyPlaybackService } from './spotify-playback-service'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('SpotifyPlaybackService', () => {
  it('validates and forwards seek and volume commands with the current access token', async () => {
    vi.spyOn(SpotifyAuthService, 'getAccessToken').mockResolvedValue('access-token')
    vi.spyOn(SpotifyPlaybackClient, 'seek').mockResolvedValue(undefined)
    vi.spyOn(SpotifyPlaybackClient, 'setVolume').mockResolvedValue(undefined)

    await SpotifyPlaybackService.seek(75_000)
    await SpotifyPlaybackService.setVolume(42)

    expect(SpotifyPlaybackClient.seek).toHaveBeenCalledWith('access-token', 75_000)
    expect(SpotifyPlaybackClient.setVolume).toHaveBeenCalledWith('access-token', 42)
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
    expect(accessTokenSpy).not.toHaveBeenCalled()
  })
})
