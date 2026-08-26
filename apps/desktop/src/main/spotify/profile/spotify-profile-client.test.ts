import { afterEach, describe, expect, it, vi } from 'vitest'

import { SpotifyProfileClient } from './spotify-profile-client'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('SpotifyProfileClient', () => {
  it('loads and maps only the profile data used by the application', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          account_id: 'stable-account-id',
          display_name: 'William',
          images: [
            {
              url: 'https://i.scdn.co/image/profile',
              height: 300,
              width: 300
            }
          ],
          external_urls: {
            spotify: 'https://open.spotify.com/user/public-id'
          },
          id: 'public-id',
          type: 'user',
          uri: 'spotify:user:public-id'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    )
    vi.stubGlobal('fetch', fetchMock)

    const profile = await SpotifyProfileClient.getCurrentProfile('access-token')

    expect(fetchMock).toHaveBeenCalledWith('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: 'Bearer access-token'
      }
    })
    expect(profile).toEqual({
      accountId: 'stable-account-id',
      displayName: 'William',
      imageUrl: 'https://i.scdn.co/image/profile',
      profileUrl: 'https://open.spotify.com/user/public-id'
    })
  })

  it('preserves nullable public profile fields', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            account_id: 'stable-account-id',
            display_name: null,
            images: [],
            external_urls: {
              spotify: 'https://open.spotify.com/user/public-id'
            }
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
    )

    await expect(SpotifyProfileClient.getCurrentProfile('access-token')).resolves.toMatchObject({
      displayName: null,
      imageUrl: null
    })
  })
})
