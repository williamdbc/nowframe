import { afterEach, describe, expect, it, vi } from 'vitest'

import { LrclibClient } from './lrclib-client'
import { LyricsService } from './lyrics-service'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('LyricsService', () => {
  it('forwards valid normalized track metadata', async () => {
    const getLyricsSpy = vi.spyOn(LrclibClient, 'get').mockResolvedValue(null)

    await LyricsService.get({
      albumName: ' Crazy World ',
      artistName: ' Scorpions ',
      durationMs: 312_000,
      trackName: ' Wind Of Change '
    })

    expect(getLyricsSpy).toHaveBeenCalledWith({
      albumName: 'Crazy World',
      artistName: 'Scorpions',
      durationMs: 312_000,
      trackName: 'Wind Of Change'
    })
  })

  it('rejects invalid metadata before contacting LRCLIB', async () => {
    const getLyricsSpy = vi.spyOn(LrclibClient, 'get')

    await expect(LyricsService.get({ trackName: '' })).rejects.toThrow(
      'Os dados da música são inválidos para buscar a letra.'
    )
    expect(getLyricsSpy).not.toHaveBeenCalled()
  })
})
