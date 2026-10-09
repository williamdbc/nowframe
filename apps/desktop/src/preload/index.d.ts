import type { NowframeApi } from '../contracts/nowframe-api'
import type { DemoCursorApi } from '../contracts/demo-cursor-api'

declare global {
  interface Window {
    nowframe: NowframeApi
    nowframeDemo: DemoCursorApi
  }
}
