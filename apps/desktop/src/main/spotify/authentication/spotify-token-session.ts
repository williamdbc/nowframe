import { z } from 'zod'

export const spotifyTokenSessionSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  accessTokenExpiresAt: z.number().int().positive(),
  authorizedAt: z.number().int().positive(),
  scope: z.string()
})

export type SpotifyTokenSession = z.infer<typeof spotifyTokenSessionSchema>
