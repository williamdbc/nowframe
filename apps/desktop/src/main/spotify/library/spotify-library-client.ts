import { z } from 'zod'

import type { SpotifyLibraryItemState } from '../../../contracts/nowframe-api'

const spotifyLibraryUrl = 'https://api.spotify.com/v1/me/library'

const spotifyLibraryContainsResponseSchema = z.array(z.boolean()).min(1)
const spotifyApiErrorSchema = z.object({
  error: z.object({
    message: z.string()
  })
})

async function createSpotifyApiError(response: Response, fallbackMessage: string): Promise<Error> {
  const payload: unknown = await response.json().catch(() => null)
  const apiError = spotifyApiErrorSchema.safeParse(payload)
  return new Error(apiError.success ? apiError.data.error.message : fallbackMessage)
}

async function requestLibraryItem(
  accessToken: string,
  uri: string,
  method: 'DELETE' | 'GET' | 'PUT',
  path: '' | '/contains',
  fallbackMessage: string
): Promise<Response> {
  const response = await fetch(`${spotifyLibraryUrl}${path}?uris=${encodeURIComponent(uri)}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  if (!response.ok) throw await createSpotifyApiError(response, fallbackMessage)
  return response
}

export class SpotifyLibraryClient {
  static async getItemState(accessToken: string, uri: string): Promise<SpotifyLibraryItemState> {
    const response = await requestLibraryItem(
      accessToken,
      uri,
      'GET',
      '/contains',
      'Não foi possível consultar a biblioteca do Spotify.'
    )
    const payload: unknown = await response.json().catch(() => null)
    const [isSaved] = spotifyLibraryContainsResponseSchema.parse(payload)

    return { isSaved, uri }
  }

  static async saveItem(accessToken: string, uri: string): Promise<void> {
    await requestLibraryItem(
      accessToken,
      uri,
      'PUT',
      '',
      'Não foi possível adicionar o conteúdo à biblioteca.'
    )
  }

  static async removeItem(accessToken: string, uri: string): Promise<void> {
    await requestLibraryItem(
      accessToken,
      uri,
      'DELETE',
      '',
      'Não foi possível remover o conteúdo da biblioteca.'
    )
  }
}
