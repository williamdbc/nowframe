import type { MusicDisplayApi } from '../contracts/music-display-api'

declare global {
  interface Window {
    musicDisplay: MusicDisplayApi
  }
}
