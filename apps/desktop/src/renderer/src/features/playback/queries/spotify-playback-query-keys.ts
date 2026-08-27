export const spotifyPlaybackQueryKeys = {
  all: ['spotify-playback'] as const,
  current: () => [...spotifyPlaybackQueryKeys.all, 'current'] as const
}
