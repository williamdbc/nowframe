import { z } from 'zod'

import type {
  SpotifyPlaybackItem,
  SpotifyPlaybackState
} from '../../../contracts/music-display-api'

const spotifyPlaybackUrl = 'https://api.spotify.com/v1/me/player'
let rateLimitedUntil = 0

const spotifyImageSchema = z.object({
  url: z.string().url()
})

const spotifyTrackSchema = z.object({
  id: z.string().nullable().optional(),
  type: z.literal('track'),
  name: z.string(),
  duration_ms: z.number().int().nonnegative(),
  artists: z.array(z.object({ name: z.string() })),
  album: z.object({
    name: z.string(),
    images: z.array(spotifyImageSchema)
  })
})

const spotifyEpisodeSchema = z.object({
  id: z.string().nullable().optional(),
  type: z.literal('episode'),
  name: z.string(),
  duration_ms: z.number().int().nonnegative(),
  images: z.array(spotifyImageSchema),
  show: z.object({
    name: z.string(),
    images: z.array(spotifyImageSchema).optional().default([])
  })
})

const spotifyPlaybackResponseSchema = z.object({
  device: z.object({
    id: z.string().nullable(),
    is_restricted: z.boolean(),
    name: z.string(),
    type: z.string(),
    volume_percent: z.number().int().min(0).max(100).nullable(),
    supports_volume: z.boolean()
  }),
  is_playing: z.boolean(),
  item: z.unknown().nullable(),
  progress_ms: z.number().int().nonnegative().nullable()
})

const spotifyApiErrorSchema = z.object({
  error: z.object({
    status: z.number().int(),
    message: z.string()
  })
})

function mapPlaybackItem(item: unknown): SpotifyPlaybackItem | null {
  const track = spotifyTrackSchema.safeParse(item)

  if (track.success) {
    return {
      collectionName: track.data.album.name,
      creatorNames: track.data.artists.map((artist) => artist.name),
      durationMs: track.data.duration_ms,
      id: track.data.id ?? null,
      imageUrl: track.data.album.images[0]?.url ?? null,
      title: track.data.name,
      type: 'track'
    }
  }

  const episode = spotifyEpisodeSchema.safeParse(item)

  if (episode.success) {
    return {
      collectionName: episode.data.show.name,
      creatorNames: [episode.data.show.name],
      durationMs: episode.data.duration_ms,
      id: episode.data.id ?? null,
      imageUrl: episode.data.images[0]?.url ?? episode.data.show.images[0]?.url ?? null,
      title: episode.data.name,
      type: 'episode'
    }
  }

  return null
}

function getRetryAfterMilliseconds(response: Response): number {
  const retryAfterSeconds = Number(response.headers.get('Retry-After'))
  return Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
    ? retryAfterSeconds * 1000
    : 30_000
}

export class SpotifyPlaybackClient {
  static async getCurrentPlayback(accessToken: string): Promise<SpotifyPlaybackState | null> {
    if (Date.now() < rateLimitedUntil) {
      throw new Error('O Spotify solicitou uma pausa antes da próxima sincronização.')
    }

    const response = await fetch(spotifyPlaybackUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    if (response.status === 204) return null

    const payload: unknown = await response.json().catch(() => null)

    if (!response.ok) {
      if (response.status === 429) {
        rateLimitedUntil = Date.now() + getRetryAfterMilliseconds(response)
      }

      const apiError = spotifyApiErrorSchema.safeParse(payload)
      throw new Error(
        apiError.success
          ? apiError.data.error.message
          : 'Não foi possível sincronizar a reprodução do Spotify.'
      )
    }

    const playback = spotifyPlaybackResponseSchema.parse(payload)

    return {
      device: {
        id: playback.device.id,
        isRestricted: playback.device.is_restricted,
        name: playback.device.name,
        supportsVolume: playback.device.supports_volume,
        type: playback.device.type,
        volumePercent: playback.device.volume_percent
      },
      isPlaying: playback.is_playing,
      item: mapPlaybackItem(playback.item),
      progressMs: playback.progress_ms ?? 0,
      synchronizedAt: Date.now()
    }
  }
}
