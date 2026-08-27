import type { SpotifyTracklistTrack } from '../../../../../contracts/music-display-api'

export interface PlayContextTrackMutationVariables {
  contextUri: string
  track: SpotifyTracklistTrack
}
