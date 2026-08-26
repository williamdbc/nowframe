export const spotifySessionQueryKeys = {
  all: ['spotify-session'] as const,
  state: () => [...spotifySessionQueryKeys.all, 'state'] as const
}
