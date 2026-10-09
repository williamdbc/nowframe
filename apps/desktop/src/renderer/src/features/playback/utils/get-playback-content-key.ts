import type { SpotifyPlaybackItem } from '../../../../../contracts/nowframe-api'

export function getPlaybackItemKey(item: SpotifyPlaybackItem | null | undefined): string | null {
  if (!item) return null

  return item.id
    ? `${item.type}:${item.id}`
    : [
        item.type,
        item.title,
        item.collectionName,
        item.creatorNames.join(','),
        item.durationMs
      ].join(':')
}

export function getPlaybackContentKey(
  playback: { item: SpotifyPlaybackItem | null } | null | undefined
): string | null {
  return getPlaybackItemKey(playback?.item)
}
