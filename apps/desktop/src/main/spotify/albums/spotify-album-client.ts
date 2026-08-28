import { z } from 'zod'

import type { SpotifyAlbumTracklist, SpotifyTracklistTrack } from '../../../contracts/nowframe-api'

const spotifyAlbumsUrl = 'https://api.spotify.com/v1/albums'
const albumTracksPageSize = 50

const spotifyAlbumTrackSchema = z.object({
  artists: z.array(z.object({ name: z.string() })),
  disc_number: z.number().int().positive(),
  duration_ms: z.number().int().nonnegative(),
  id: z.string(),
  is_playable: z.boolean().optional().default(true),
  name: z.string(),
  track_number: z.number().int().positive(),
  uri: z.string()
})

const spotifyAlbumTracksPageSchema = z.object({
  items: z.array(spotifyAlbumTrackSchema),
  offset: z.number().int().nonnegative(),
  total: z.number().int().nonnegative()
})

const spotifyApiErrorSchema = z.object({
  error: z.object({ message: z.string() })
})

async function createSpotifyApiError(response: Response): Promise<Error> {
  const payload: unknown = await response.json().catch(() => null)
  const apiError = spotifyApiErrorSchema.safeParse(payload)
  return new Error(
    apiError.success
      ? apiError.data.error.message
      : 'Não foi possível carregar as faixas deste álbum.'
  )
}

function mapAlbumTrack(
  track: z.infer<typeof spotifyAlbumTrackSchema>,
  position: number
): SpotifyTracklistTrack {
  return {
    creatorNames: track.artists.map((artist) => artist.name),
    discNumber: track.disc_number,
    durationMs: track.duration_ms,
    id: track.id,
    imageUrl: null,
    isPlayable: track.is_playable,
    position,
    title: track.name,
    trackNumber: track.track_number,
    uri: track.uri
  } satisfies SpotifyTracklistTrack
}

export class SpotifyAlbumClient {
  static async getTracks(accessToken: string, albumId: string): Promise<SpotifyAlbumTracklist> {
    const tracks: SpotifyTracklistTrack[] = []
    let offset = 0
    let total = 0

    do {
      const response = await fetch(
        `${spotifyAlbumsUrl}/${encodeURIComponent(albumId)}/tracks?limit=${albumTracksPageSize}&offset=${offset}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )

      if (!response.ok) throw await createSpotifyApiError(response)

      const payload: unknown = await response.json().catch(() => null)
      const page = spotifyAlbumTracksPageSchema.parse(payload)
      tracks.push(...page.items.map((track, index) => mapAlbumTrack(track, page.offset + index)))
      total = page.total
      offset = page.offset + page.items.length

      if (page.items.length === 0) break
    } while (offset < total)

    return { albumId, tracks }
  }
}
