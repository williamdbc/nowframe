export interface PlaybackState {
  isPlaying: boolean
  trackName: string
  artistNames: string[]
  albumName: string
  albumImageUrl: string | null
  durationMs: number
  progressMs: number
}
