export const spotifyPlaybackQueryKeys = {
  all: ['spotify-playback'] as const,
  current: () => [...spotifyPlaybackQueryKeys.all, 'current'] as const,
  queue: (currentItemKey: string) =>
    [...spotifyPlaybackQueryKeys.all, 'queue', currentItemKey] as const
}
