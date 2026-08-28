export class WindowService {
  static getState(): ReturnType<typeof window.nowframe.window.getState> {
    return window.nowframe.window.getState()
  }

  static setFullScreen(
    isFullScreen: boolean
  ): ReturnType<typeof window.nowframe.window.setFullScreen> {
    return window.nowframe.window.setFullScreen(isFullScreen)
  }
}
