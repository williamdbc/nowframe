import type { SpotifyPlaybackService } from '../services/spotify-playback-service'

export type PlaybackState = NonNullable<
  Awaited<ReturnType<typeof SpotifyPlaybackService.getCurrentPlayback>>
>

export type PlaybackLoadStatus = 'error' | 'loading' | 'ready'
