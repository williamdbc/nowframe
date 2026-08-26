import { createHash, randomBytes } from 'node:crypto'

import type { SpotifyEnvironment } from '../../config/spotify-environment'
import { getSpotifyAuthorizationScope } from './spotify-scopes'

const spotifyAuthorizeUrl = 'https://accounts.spotify.com/authorize'

export interface SpotifyPkceAuthorization {
  codeVerifier: string
  codeChallenge: string
  state: string
}

function createRandomBase64Url(byteLength: number): string {
  return randomBytes(byteLength).toString('base64url')
}

export function createSpotifyPkceAuthorization(): SpotifyPkceAuthorization {
  const codeVerifier = createRandomBase64Url(64)

  return {
    codeVerifier,
    codeChallenge: createHash('sha256').update(codeVerifier).digest('base64url'),
    state: createRandomBase64Url(32)
  }
}

export function createSpotifyAuthorizationUrl(
  environment: SpotifyEnvironment,
  authorization: SpotifyPkceAuthorization
): URL {
  const authorizationUrl = new URL(spotifyAuthorizeUrl)

  authorizationUrl.search = new URLSearchParams({
    client_id: environment.clientId,
    response_type: 'code',
    redirect_uri: environment.redirectUri,
    scope: getSpotifyAuthorizationScope(),
    code_challenge_method: 'S256',
    code_challenge: authorization.codeChallenge,
    state: authorization.state
  }).toString()

  return authorizationUrl
}
