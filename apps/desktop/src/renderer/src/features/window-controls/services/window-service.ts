export class WindowService {
  static getState(): ReturnType<typeof window.musicDisplay.window.getState> {
    return window.musicDisplay.window.getState()
  }

  static setFullScreen(
    isFullScreen: boolean
  ): ReturnType<typeof window.musicDisplay.window.setFullScreen> {
    return window.musicDisplay.window.setFullScreen(isFullScreen)
  }
}
