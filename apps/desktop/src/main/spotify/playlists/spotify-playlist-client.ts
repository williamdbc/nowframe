import { z } from 'zod'

import type {
  SpotifyPlaylistTracklist,
  SpotifyTracklistTrack
} from '../../../contracts/music-display-api'

const spotifyPlaylistsUrl = 'https://api.spotify.com/v1/playlists'
const playlistItemsPageSize = 50

const spotifyImageSchema = z.object({ url: z.string().url() })

const spotifyPlaylistSchema = z.object({
  id: z.string(),
  images: z.array(spotifyImageSchema),
  name: z.string()
})

const spotifyPlaylistTrackSchema = z.object({
  album: z.object({ images: z.array(spotifyImageSchema) }),
  artists: z.array(z.object({ name: z.string() })),
  disc_number: z.number().int().positive(),
  duration_ms: z.number().int().nonnegative(),
  id: z.string(),
  is_playable: z.boolean().optional().default(true),
  name: z.string(),
  track_number: z.number().int().positive(),
  type: z.literal('track'),
  uri: z.string()
})

const spotifyPlaylistItemsPageSchema = z.object({
  items: z.array(z.object({ track: z.unknown().nullable() })),
  offset: z.number().int().nonnegative(),
  total: z.number().int().nonnegative()
})

const spotifyApiErrorSchema = z.object({
  error: z.object({ message: z.string() })
})

async function createSpotifyApiError(response: Response): Promise<Error> {
  if (response.status === 403) {
    return new Error(
      'O Spotify só permite listar playlists da sua conta ou em que você é colaborador.'
    )
  }

  const payload: unknown = await response.json().catch(() => null)
  const apiError = spotifyApiErrorSchema.safeParse(payload)
  return new Error(
    apiError.success ? apiError.data.error.message : 'Não foi possível carregar esta playlist.'
  )
}

function mapPlaylistTrack(track: unknown, position: number): SpotifyTracklistTrack | null {
  const parsedTrack = spotifyPlaylistTrackSchema.safeParse(track)
  if (!parsedTrack.success) return null

  return {
    creatorNames: parsedTrack.data.artists.map((artist) => artist.name),
    discNumber: parsedTrack.data.disc_number,
    durationMs: parsedTrack.data.duration_ms,
    id: parsedTrack.data.id,
    imageUrl: parsedTrack.data.album.images[0]?.url ?? null,
    isPlayable: parsedTrack.data.is_playable,
    position,
    title: parsedTrack.data.name,
    trackNumber: parsedTrack.data.track_number,
    uri: parsedTrack.data.uri
  }
}

async function fetchSpotifyJson(accessToken: string, url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })

  if (!response.ok) throw await createSpotifyApiError(response)
  return response.json().catch(() => null)
}

export class SpotifyPlaylistClient {
  static async getTracks(
    accessToken: string,
    playlistId: string
  ): Promise<SpotifyPlaylistTracklist> {
    const encodedPlaylistId = encodeURIComponent(playlistId)
    const playlistPayload = await fetchSpotifyJson(
      accessToken,
      `${spotifyPlaylistsUrl}/${encodedPlaylistId}?fields=id,name,images`
    )
    const playlist = spotifyPlaylistSchema.parse(playlistPayload)
    const tracks: SpotifyTracklistTrack[] = []
    let offset = 0
    let total = 0

    do {
      const pagePayload = await fetchSpotifyJson(
        accessToken,
        `${spotifyPlaylistsUrl}/${encodedPlaylistId}/items?limit=${playlistItemsPageSize}&offset=${offset}`
      )
      const page = spotifyPlaylistItemsPageSchema.parse(pagePayload)

      for (const [index, item] of page.items.entries()) {
        const track = mapPlaylistTrack(item.track, page.offset + index)
        if (track) tracks.push(track)
      }

      total = page.total
      offset = page.offset + page.items.length
      if (page.items.length === 0) break
    } while (offset < total)

    return {
      imageUrl: playlist.images[0]?.url ?? null,
      name: playlist.name,
      playlistId: playlist.id,
      tracks
    }
  }
}
