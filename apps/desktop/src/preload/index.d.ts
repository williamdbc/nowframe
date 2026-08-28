import type { NowframeApi } from '../contracts/nowframe-api'

declare global {
  interface Window {
    nowframe: NowframeApi
  }
}
