import { z } from 'zod'

import { isRateLimited, noteRateLimited, noteRequestSucceeded } from '../spotify-rate-limit'
import type {
  SpotifyPlaybackContext,
  SpotifyPlaybackItem,
  SpotifyPlaybackQueue,
  SpotifyPlaybackState,
  SpotifyRepeatMode
} from '../../../contracts/nowframe-api'

const spotifyPlaybackUrl = 'https://api.spotify.com/v1/me/player'
const maximumQueuedItems = 5

type SpotifyPlaybackCommandPath =
  | '/next'
  | '/pause'
  | '/play'
  | '/previous'
  | `/seek?position_ms=${number}`
  | `/repeat?state=${SpotifyRepeatMode}`
  | `/shuffle?state=${boolean}`
  | `/volume?volume_percent=${number}`

const spotifyImageSchema = z.object({
  url: z.string().url()
})

const spotifyTrackSchema = z.object({
  id: z.string().nullable().optional(),
  type: z.literal('track'),
  name: z.string(),
  duration_ms: z.number().int().nonnegative(),
  artists: z.array(z.object({ name: z.string() })),
  album: z.object({
    id: z.string(),
    name: z.string(),
    images: z.array(spotifyImageSchema),
    uri: z.string()
  }),
  uri: z.string().nullable().optional()
})

const spotifyEpisodeSchema = z.object({
  id: z.string().nullable().optional(),
  type: z.literal('episode'),
  name: z.string(),
  duration_ms: z.number().int().nonnegative(),
  images: z.array(spotifyImageSchema),
  show: z.object({
    name: z.string(),
    images: z.array(spotifyImageSchema).optional().default([])
  }),
  uri: z.string().nullable().optional()
})

const spotifyPlaybackResponseSchema = z.object({
  context: z
    .object({
      type: z.string(),
      uri: z.string()
    })
    .nullable()
    .optional()
    .default(null),
  device: z.object({
    id: z.string().nullable(),
    is_restricted: z.boolean(),
    name: z.string(),
    type: z.string(),
    volume_percent: z.number().int().min(0).max(100).nullable(),
    supports_volume: z.boolean()
  }),
  is_playing: z.boolean(),
  repeat_state: z.enum(['context', 'off', 'track']),
  shuffle_state: z.boolean(),
  item: z.unknown().nullable(),
  progress_ms: z.number().int().nonnegative().nullable(),
  actions: z
    .object({
      pausing: z.boolean().optional(),
      resuming: z.boolean().optional(),
      seeking: z.boolean().optional(),
      skipping_next: z.boolean().optional(),
      skipping_prev: z.boolean().optional(),
      toggling_repeat_context: z.boolean().optional(),
      toggling_repeat_track: z.boolean().optional(),
      toggling_shuffle: z.boolean().optional()
    })
    .optional()
    .default({})
})

function mapPlaybackContext(
  context: z.infer<typeof spotifyPlaybackResponseSchema>['context']
): SpotifyPlaybackContext | null {
  if (!context || (context.type !== 'album' && context.type !== 'playlist')) return null

  const uriPrefix = `spotify:${context.type}:`
  if (!context.uri.startsWith(uriPrefix)) return null

  const id = context.uri.slice(uriPrefix.length)
  if (!/^[A-Za-z0-9]+$/.test(id)) return null

  return { id, type: context.type, uri: context.uri }
}

const spotifyApiErrorSchema = z.object({
  error: z.object({
    status: z.number().int(),
    message: z.string()
  })
})

const spotifyQueueResponseSchema = z.object({
  queue: z.array(z.unknown()).optional().default([])
})

function mapPlaybackItem(item: unknown): SpotifyPlaybackItem | null {
  const track = spotifyTrackSchema.safeParse(item)

  if (track.success) {
    return {
      album: {
        id: track.data.album.id,
        uri: track.data.album.uri
      },
      collectionName: track.data.album.name,
      creatorNames: track.data.artists.map((artist) => artist.name),
      durationMs: track.data.duration_ms,
      id: track.data.id ?? null,
      imageUrl: track.data.album.images[0]?.url ?? null,
      title: track.data.name,
      type: 'track',
      uri: track.data.uri ?? null
    }
  }

  const episode = spotifyEpisodeSchema.safeParse(item)

  if (episode.success) {
    return {
      album: null,
      collectionName: episode.data.show.name,
      creatorNames: [episode.data.show.name],
      durationMs: episode.data.duration_ms,
      id: episode.data.id ?? null,
      imageUrl: episode.data.images[0]?.url ?? episode.data.show.images[0]?.url ?? null,
      title: episode.data.name,
      type: 'episode',
      uri: episode.data.uri ?? null
    }
  }

  return null
}

/**
 * O `progress_ms` devolvido pelo Spotify era verdade no servidor por volta da metade da
 * viagem de ida e volta, não no momento em que a resposta chegou. Estampar `Date.now()`
 * na chegada faz o relógio local nascer atrasado por ~RTT/2 (medido: 75–130 ms), viés que
 * todo o cálculo de progresso e a sincronia da letra herdam.
 */
export function estimatePlaybackSynchronizedAt(
  requestStartedAt: number,
  respondedAt: number
): number {
  const roundTripMs = Math.max(0, respondedAt - requestStartedAt)
  return requestStartedAt + Math.round(roundTripMs / 2)
}

/**
 * Só as consultas periódicas esperam a janela de rate limit. Comandos da pessoa passam
 * direto — ver `spotify-rate-limit.ts`.
 */
function ensurePollingIsAllowed(): void {
  if (isRateLimited()) {
    throw new Error('O Spotify solicitou uma pausa antes da próxima solicitação.')
  }
}

async function createSpotifyApiError(
  response: Response,
  fallbackMessage: string,
  restrictionMessage?: string
): Promise<Error> {
  if (response.status === 429) {
    noteRateLimited(response.headers.get('Retry-After'))
  }

  const payload: unknown = await response.json().catch(() => null)
  const apiError = spotifyApiErrorSchema.safeParse(payload)
  const apiMessage = apiError.success ? apiError.data.error.message : null

  if (
    response.status === 403 &&
    restrictionMessage &&
    apiMessage?.toLowerCase().includes('restriction violated')
  ) {
    return new Error(restrictionMessage)
  }

  return new Error(apiMessage ?? fallbackMessage)
}

async function sendPlaybackCommand(
  accessToken: string,
  path: SpotifyPlaybackCommandPath,
  method: 'POST' | 'PUT',
  fallbackMessage: string,
  restrictionMessage?: string,
  body?: unknown
): Promise<void> {
  const response = await fetch(`${spotifyPlaybackUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  })

  if (!response.ok) {
    throw await createSpotifyApiError(response, fallbackMessage, restrictionMessage)
  }

  noteRequestSucceeded()
}

export class SpotifyPlaybackClient {
  static async getCurrentPlayback(accessToken: string): Promise<SpotifyPlaybackState | null> {
    ensurePollingIsAllowed()

    const requestStartedAt = Date.now()
    const response = await fetch(spotifyPlaybackUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    if (response.status === 204) {
      noteRequestSucceeded()
      return null
    }

    if (!response.ok) {
      throw await createSpotifyApiError(
        response,
        'Não foi possível sincronizar a reprodução do Spotify.'
      )
    }

    noteRequestSucceeded()

    const payload: unknown = await response.json().catch(() => null)
    const playback = spotifyPlaybackResponseSchema.parse(payload)
    const isRestricted = playback.device.is_restricted
    const isNextRepeatModeRestricted =
      playback.repeat_state === 'off'
        ? playback.actions.toggling_repeat_context
        : playback.actions.toggling_repeat_track

    return {
      capabilities: {
        canPause: !isRestricted && !playback.actions.pausing,
        canResume: !isRestricted && !playback.actions.resuming,
        canSeek: !isRestricted && !playback.actions.seeking,
        canSetVolume: !isRestricted && playback.device.supports_volume,
        canSkipNext: !isRestricted && !playback.actions.skipping_next,
        canSkipPrevious: !isRestricted && !playback.actions.skipping_prev,
        canToggleRepeat: !isRestricted && !isNextRepeatModeRestricted,
        canToggleShuffle: !isRestricted && !playback.actions.toggling_shuffle
      },
      context: mapPlaybackContext(playback.context),
      device: {
        id: playback.device.id,
        isRestricted: playback.device.is_restricted,
        name: playback.device.name,
        supportsVolume: playback.device.supports_volume,
        type: playback.device.type,
        volumePercent: playback.device.volume_percent
      },
      isPlaying: playback.is_playing,
      item: mapPlaybackItem(playback.item),
      progressMs: playback.progress_ms ?? 0,
      repeatMode: playback.repeat_state,
      shuffleEnabled: playback.shuffle_state,
      synchronizedAt: estimatePlaybackSynchronizedAt(requestStartedAt, Date.now())
    }
  }

  static async getQueue(accessToken: string): Promise<SpotifyPlaybackQueue> {
    ensurePollingIsAllowed()

    const response = await fetch(`${spotifyPlaybackUrl}/queue`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    if (response.status === 204) {
      noteRequestSucceeded()
      return { items: [] }
    }

    if (!response.ok) {
      throw await createSpotifyApiError(
        response,
        'Não foi possível consultar a fila de reprodução do Spotify.'
      )
    }

    noteRequestSucceeded()

    const payload: unknown = await response.json().catch(() => null)
    const queue = spotifyQueueResponseSchema.parse(payload)

    return {
      items: queue.queue
        .slice(0, maximumQueuedItems)
        .map(mapPlaybackItem)
        .filter((item): item is SpotifyPlaybackItem => item !== null)
    }
  }

  static pause(accessToken: string): Promise<void> {
    return sendPlaybackCommand(
      accessToken,
      '/pause',
      'PUT',
      'Não foi possível pausar a reprodução do Spotify.'
    )
  }

  static resume(accessToken: string): Promise<void> {
    return sendPlaybackCommand(
      accessToken,
      '/play',
      'PUT',
      'Não foi possível retomar a reprodução do Spotify.'
    )
  }

  static playContextTrack(
    accessToken: string,
    contextUri: string,
    position: number
  ): Promise<void> {
    return sendPlaybackCommand(
      accessToken,
      '/play',
      'PUT',
      'Não foi possível reproduzir a faixa selecionada.',
      undefined,
      {
        context_uri: contextUri,
        offset: { position },
        position_ms: 0
      }
    )
  }

  static seek(accessToken: string, positionMs: number): Promise<void> {
    return sendPlaybackCommand(
      accessToken,
      `/seek?position_ms=${positionMs}`,
      'PUT',
      'Não foi possível alterar a posição da reprodução.'
    )
  }

  static setVolume(accessToken: string, volumePercent: number): Promise<void> {
    return sendPlaybackCommand(
      accessToken,
      `/volume?volume_percent=${volumePercent}`,
      'PUT',
      'Não foi possível alterar o volume da reprodução.'
    )
  }

  static setRepeatMode(accessToken: string, repeatMode: SpotifyRepeatMode): Promise<void> {
    return sendPlaybackCommand(
      accessToken,
      `/repeat?state=${repeatMode}`,
      'PUT',
      'Não foi possível alterar o modo de repetição.'
    )
  }

  static setShuffle(accessToken: string, enabled: boolean): Promise<void> {
    return sendPlaybackCommand(
      accessToken,
      `/shuffle?state=${enabled}`,
      'PUT',
      'Não foi possível alterar o modo aleatório.'
    )
  }

  static skipToNext(accessToken: string): Promise<void> {
    return sendPlaybackCommand(
      accessToken,
      '/next',
      'POST',
      'Não foi possível avançar para o próximo conteúdo.',
      'Não é possível avançar agora. Você pode estar no fim da fila ou este conteúdo não permite essa ação.'
    )
  }

  static skipToPrevious(accessToken: string): Promise<void> {
    return sendPlaybackCommand(
      accessToken,
      '/previous',
      'POST',
      'Não foi possível voltar para o conteúdo anterior.',
      'Não é possível voltar agora. Você pode já estar na primeira faixa ou este conteúdo não permite essa ação.'
    )
  }
}
