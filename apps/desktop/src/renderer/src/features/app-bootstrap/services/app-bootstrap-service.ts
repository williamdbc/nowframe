export class AppBootstrapService {
  static getState(): ReturnType<typeof window.musicDisplay.app.getBootstrapState> {
    return window.musicDisplay.app.getBootstrapState()
  }
}
