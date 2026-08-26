import { z } from 'zod'

import type { SpotifyProfile } from '../../../contracts/music-display-api'

const spotifyCurrentProfileUrl = 'https://api.spotify.com/v1/me'

const spotifyProfileResponseSchema = z.object({
  account_id: z.string().min(1),
  display_name: z.string().nullable(),
  images: z.array(
    z.object({
      url: z.string().url(),
      height: z.number().int().nullable(),
      width: z.number().int().nullable()
    })
  ),
  external_urls: z.object({
    spotify: z.string().url()
  })
})

const spotifyApiErrorSchema = z.object({
  error: z.object({
    status: z.number().int(),
    message: z.string()
  })
})

export class SpotifyProfileClient {
  static async getCurrentProfile(accessToken: string): Promise<SpotifyProfile> {
    const response = await fetch(spotifyCurrentProfileUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    const payload: unknown = await response.json().catch(() => null)

    if (!response.ok) {
      const apiError = spotifyApiErrorSchema.safeParse(payload)
      throw new Error(
        apiError.success
          ? apiError.data.error.message
          : 'Não foi possível carregar o perfil do Spotify.'
      )
    }

    const profile = spotifyProfileResponseSchema.parse(payload)

    return {
      accountId: profile.account_id,
      displayName: profile.display_name,
      imageUrl: profile.images[0]?.url ?? null,
      profileUrl: profile.external_urls.spotify
    }
  }
}
