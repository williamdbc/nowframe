export const spotifyAuthorizationScopes = [
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state'
] as const

export function getSpotifyAuthorizationScope(): string {
  return spotifyAuthorizationScopes.join(' ')
}

export function hasRequiredSpotifyAuthorizationScopes(grantedScope: string): boolean {
  const grantedScopes = new Set(grantedScope.split(/\s+/).filter(Boolean))
  return spotifyAuthorizationScopes.every((scope) => grantedScopes.has(scope))
}
