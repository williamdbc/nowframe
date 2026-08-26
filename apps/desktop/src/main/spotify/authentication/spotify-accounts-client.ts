import { z } from 'zod'

const spotifyTokenUrl = 'https://accounts.spotify.com/api/token'

const spotifyTokenResponseSchema = z.object({
  access_token: z.string().min(1),
  token_type: z.literal('Bearer'),
  scope: z.string().optional().default(''),
  expires_in: z.number().int().positive(),
  refresh_token: z.string().min(1).optional()
})

const spotifyTokenErrorSchema = z.object({
  error: z.string(),
  error_description: z.string().optional()
})

export interface SpotifyTokenResponse {
  accessToken: string
  expiresInSeconds: number
  refreshToken: string | null
  scope: string
}

export class SpotifyAccountsError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
    message: string
  ) {
    super(message)
    this.name = 'SpotifyAccountsError'
  }
}

async function requestToken(body: URLSearchParams): Promise<SpotifyTokenResponse> {
  const response = await fetch(spotifyTokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  })
  const payload: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const tokenError = spotifyTokenErrorSchema.safeParse(payload)
    const code = tokenError.success ? tokenError.data.error : 'token_request_failed'
    const message = tokenError.success
      ? (tokenError.data.error_description ?? tokenError.data.error)
      : 'O Spotify recusou a solicitação de token.'

    throw new SpotifyAccountsError(code, response.status, message)
  }

  const token = spotifyTokenResponseSchema.parse(payload)

  return {
    accessToken: token.access_token,
    expiresInSeconds: token.expires_in,
    refreshToken: token.refresh_token ?? null,
    scope: token.scope
  }
}

export class SpotifyAccountsClient {
  static exchangeAuthorizationCode(request: {
    clientId: string
    code: string
    codeVerifier: string
    redirectUri: string
  }): Promise<SpotifyTokenResponse> {
    return requestToken(
      new URLSearchParams({
        client_id: request.clientId,
        grant_type: 'authorization_code',
        code: request.code,
        redirect_uri: request.redirectUri,
        code_verifier: request.codeVerifier
      })
    )
  }

  static refreshAccessToken(request: {
    clientId: string
    refreshToken: string
  }): Promise<SpotifyTokenResponse> {
    return requestToken(
      new URLSearchParams({
        client_id: request.clientId,
        grant_type: 'refresh_token',
        refresh_token: request.refreshToken
      })
    )
  }
}
