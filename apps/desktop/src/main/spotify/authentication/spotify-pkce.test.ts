import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'

import type { SpotifyEnvironment } from '../../config/spotify-environment'
import { createSpotifyAuthorizationUrl, createSpotifyPkceAuthorization } from './spotify-pkce'
import { hasRequiredSpotifyAuthorizationScopes } from './spotify-scopes'

describe('Spotify PKCE authorization', () => {
  it('generates a verifier, S256 challenge and CSRF state', () => {
    const authorization = createSpotifyPkceAuthorization()

    expect(authorization.codeVerifier).toMatch(/^[A-Za-z0-9_-]{43,128}$/)
    expect(authorization.codeChallenge).toBe(
      createHash('sha256').update(authorization.codeVerifier).digest('base64url')
    )
    expect(authorization.state).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('requests only the profile, playback and library scopes used by the application', () => {
    const environment: SpotifyEnvironment = {
      clientId: 'client-id',
      redirectUri: 'http://127.0.0.1:8888/callback'
    }
    const authorization = createSpotifyPkceAuthorization()
    const authorizationUrl = createSpotifyAuthorizationUrl(environment, authorization)

    expect(authorizationUrl.origin).toBe('https://accounts.spotify.com')
    expect(authorizationUrl.pathname).toBe('/authorize')
    expect(authorizationUrl.searchParams.get('scope')).toBe(
      'user-read-private user-read-playback-state user-modify-playback-state user-library-read user-library-modify'
    )
    expect(authorizationUrl.searchParams.get('code_challenge_method')).toBe('S256')
    expect(authorizationUrl.searchParams.get('redirect_uri')).toBe(environment.redirectUri)
    expect(authorizationUrl.searchParams.get('state')).toBe(authorization.state)
  })

  it('requires a new authorization when a stored session lacks a current scope', () => {
    expect(
      hasRequiredSpotifyAuthorizationScopes(
        'user-read-private user-read-playback-state user-modify-playback-state user-library-read user-library-modify'
      )
    ).toBe(true)
    expect(
      hasRequiredSpotifyAuthorizationScopes('user-read-playback-state user-modify-playback-state')
    ).toBe(false)
  })
})
