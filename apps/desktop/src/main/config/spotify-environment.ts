import { z } from 'zod'

const defaultRedirectUri = 'http://127.0.0.1:8888/callback'

const spotifyEnvironmentSchema = z.object({
  clientId: z.string().trim().min(1),
  redirectUri: z.string().url()
})

export interface SpotifyEnvironment {
  clientId: string
  redirectUri: string
}

function readSpotifyEnvironment(): ReturnType<typeof spotifyEnvironmentSchema.safeParse> {
  return spotifyEnvironmentSchema.safeParse({
    clientId: import.meta.env.MAIN_VITE_SPOTIFY_CLIENT_ID ?? '',
    redirectUri: import.meta.env.MAIN_VITE_SPOTIFY_REDIRECT_URI ?? defaultRedirectUri
  })
}

export function isSpotifyConfigured(): boolean {
  return readSpotifyEnvironment().success
}

export function getSpotifyRedirectUri(): string {
  const environment = readSpotifyEnvironment()
  return environment.success ? environment.data.redirectUri : defaultRedirectUri
}

export function getSpotifyEnvironment(): SpotifyEnvironment {
  const environment = readSpotifyEnvironment()

  if (!environment.success) {
    throw new Error('Spotify is not configured. Set the desktop MAIN_VITE_SPOTIFY_* variables.')
  }

  return environment.data
}
