import { afterEach, describe, expect, it, vi } from 'vitest'

import { SpotifyAccountsClient } from './spotify-accounts-client'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('SpotifyAccountsClient', () => {
  it('exchanges the authorization code using PKCE without a client secret', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: 'access-token',
          token_type: 'Bearer',
          scope: 'user-read-playback-state',
          expires_in: 3600,
          refresh_token: 'refresh-token'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    )
    vi.stubGlobal('fetch', fetchMock)

    await SpotifyAccountsClient.exchangeAuthorizationCode({
      clientId: 'client-id',
      code: 'authorization-code',
      codeVerifier: 'code-verifier',
      redirectUri: 'http://127.0.0.1:8888/callback'
    })

    const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit]
    const body = request.body as URLSearchParams

    expect(url).toBe('https://accounts.spotify.com/api/token')
    expect(request.method).toBe('POST')
    expect(Object.fromEntries(body)).toEqual({
      client_id: 'client-id',
      grant_type: 'authorization_code',
      code: 'authorization-code',
      redirect_uri: 'http://127.0.0.1:8888/callback',
      code_verifier: 'code-verifier'
    })
    expect(body.has('client_secret')).toBe(false)
  })

  it('preserves invalid_grant so an expired refresh token can end the session', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: 'invalid_grant',
            error_description: 'Refresh token expired'
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      )
    )

    const refresh = SpotifyAccountsClient.refreshAccessToken({
      clientId: 'client-id',
      refreshToken: 'expired-refresh-token'
    })

    await expect(refresh).rejects.toMatchObject({
      code: 'invalid_grant',
      status: 400
    })
  })
})
