export const spotifyPlaylistQueryKeys = {
  all: ['spotify-playlists'] as const,
  tracks: (playlistId: string) => [...spotifyPlaylistQueryKeys.all, 'tracks', playlistId] as const
}
