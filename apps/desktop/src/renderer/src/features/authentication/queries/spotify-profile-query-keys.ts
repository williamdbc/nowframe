export const spotifyProfileQueryKeys = {
  all: ['spotify-profile'] as const,
  current: () => [...spotifyProfileQueryKeys.all, 'current'] as const
}
