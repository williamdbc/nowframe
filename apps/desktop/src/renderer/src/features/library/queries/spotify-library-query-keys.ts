export const spotifyLibraryQueryKeys = {
  all: ['spotify-library'] as const,
  items: () => [...spotifyLibraryQueryKeys.all, 'item'] as const,
  item: (uri: string) => [...spotifyLibraryQueryKeys.items(), uri] as const
}
