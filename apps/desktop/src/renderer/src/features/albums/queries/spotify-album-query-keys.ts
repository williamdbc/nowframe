export const spotifyAlbumQueryKeys = {
  all: ['spotify-albums'] as const,
  tracks: (albumId: string) => [...spotifyAlbumQueryKeys.all, 'tracks', albumId] as const
}
