import { execFile, type ChildProcess } from 'node:child_process'
import { app, BrowserWindow, ipcMain } from 'electron'
import type { IpcMainInvokeEvent } from 'electron'

import { demoCursorChannels } from '../../contracts/demo-cursor-api'

export function registerDemoCursorIpcHandlers(): void {
  const helper = process.env.NOWFRAME_DEMO_CURSOR_HELPER
  if (
    app.isPackaged ||
    process.platform !== 'darwin' ||
    process.env.VITE_DEMO_REAL_CURSOR !== 'true' ||
    !helper
  )
    return

  let child: ChildProcess | undefined
  const watchedWindows = new WeakSet<BrowserWindow>()
  const stop = (): void => {
    child?.kill()
    child = undefined
  }
  const run = (args: string[]): Promise<void> =>
    new Promise((resolve, reject) => {
      if (child) {
        reject(new Error('O controlador de mouse já está ocupado.'))
        return
      }
      const worker = execFile(helper, args, { timeout: 7000 }, (error, _stdout, stderr) => {
        if (child === worker) child = undefined
        if (error) reject(new Error(stderr.trim() || 'Movimento do mouse interrompido.'))
        else resolve()
      })
      child = worker
    })

  function getWindow(event: IpcMainInvokeEvent): BrowserWindow {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window || event.senderFrame !== event.sender.mainFrame || !window.isFocused()) {
      throw new Error('A demonstração exige que a janela do Nowframe esteja em foco.')
    }
    if (!watchedWindows.has(window)) {
      watchedWindows.add(window)
      window.on('blur', stop)
      window.once('closed', stop)
    }
    return window
  }

  function getTarget(event: IpcMainInvokeEvent, x: unknown, y: unknown): [number, number] {
    const window = getWindow(event)
    const bounds = window.getContentBounds()
    const zoom = window.webContents.getZoomFactor()
    if (
      typeof x !== 'number' ||
      typeof y !== 'number' ||
      !Number.isFinite(x) ||
      !Number.isFinite(y) ||
      x < 0 ||
      y < 0 ||
      x * zoom >= bounds.width ||
      y * zoom >= bounds.height
    ) {
      throw new Error('O alvo do mouse está fora da janela do Nowframe.')
    }
    return [bounds.x + x * zoom, bounds.y + y * zoom]
  }

  ipcMain.handle(demoCursorChannels.prepare, (event) => {
    getWindow(event)
    return run(['check'])
  })
  ipcMain.handle(demoCursorChannels.move, (event, x: unknown, y: unknown, duration: unknown) => {
    if (
      typeof duration !== 'number' ||
      !Number.isFinite(duration) ||
      duration < 0 ||
      duration > 5000
    ) {
      throw new Error('Duração inválida para o movimento do mouse.')
    }
    const [screenX, screenY] = getTarget(event, x, y)
    return run(['move', String(screenX), String(screenY), String(duration), String(process.pid)])
  })
  ipcMain.handle(demoCursorChannels.click, (event, x: unknown, y: unknown) => {
    const [screenX, screenY] = getTarget(event, x, y)
    return run(['click', String(screenX), String(screenY), '0', String(process.pid)])
  })
  ipcMain.handle(demoCursorChannels.stop, (event) => {
    if (BrowserWindow.fromWebContents(event.sender)) stop()
  })
  app.on('before-quit', stop)
}
