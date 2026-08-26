export const spotifyAuthorizationScopes = [
  'user-read-playback-state',
  'user-modify-playback-state'
] as const

export function getSpotifyAuthorizationScope(): string {
  return spotifyAuthorizationScopes.join(' ')
}
