export class AppBootstrapService {
  static getState(): ReturnType<typeof window.nowframe.app.getBootstrapState> {
    return window.nowframe.app.getBootstrapState()
  }
}
