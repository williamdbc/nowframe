import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  handlers: new Map<string, (...args: unknown[]) => unknown>(),
  packaged: false,
  focused: true
}))

vi.mock('electron', () => ({
  app: {
    get isPackaged() {
      return state.packaged
    },
    on: () => {}
  },
  ipcMain: {
    handle: (channel: string, handler: (...args: unknown[]) => unknown) =>
      state.handlers.set(channel, handler)
  },
  BrowserWindow: {
    fromWebContents: () => ({
      isFocused: () => state.focused,
      getContentBounds: () => ({ x: 100, y: 200, width: 1000, height: 700 }),
      webContents: { getZoomFactor: () => 1.5 },
      on: () => {},
      once: () => {}
    })
  }
}))

import { demoCursorChannels } from '../../contracts/demo-cursor-api'
import { registerDemoCursorIpcHandlers } from './register-demo-cursor-ipc-handlers'

const platform = process.platform
const frame = {}
const event = { sender: { mainFrame: frame }, senderFrame: frame }

beforeEach(() => {
  state.handlers.clear()
  state.packaged = false
  state.focused = true
  Object.defineProperty(process, 'platform', { value: 'darwin', configurable: true })
  vi.stubEnv('VITE_DEMO_REAL_CURSOR', 'true')
  vi.stubEnv('NOWFRAME_DEMO_CURSOR_HELPER', '/not-a-real-helper')
})

afterEach(() => {
  Object.defineProperty(process, 'platform', { value: platform, configurable: true })
  vi.unstubAllEnvs()
})

it('never enables native mouse IPC in packaged builds', () => {
  state.packaged = true
  registerDemoCursorIpcHandlers()
  expect(state.handlers.size).toBe(0)
})

it('rejects movement when the sender window loses focus', () => {
  registerDemoCursorIpcHandlers()
  state.focused = false
  expect(() => state.handlers.get(demoCursorChannels.move)!(event, 50, 50, 650)).toThrow('em foco')
})

it.each([
  [NaN, 50],
  [-1, 50],
  [100, Infinity],
  [700, 50],
  [50, 500]
])('rejects invalid or out-of-window target (%s, %s) accounting for zoom', (x, y) => {
  registerDemoCursorIpcHandlers()
  expect(() => state.handlers.get(demoCursorChannels.click)!(event, x, y)).toThrow('fora da janela')
})

it('rejects requests from an embedded frame', () => {
  registerDemoCursorIpcHandlers()
  expect(() =>
    state.handlers.get(demoCursorChannels.click)!({ ...event, senderFrame: {} }, 50, 50)
  ).toThrow('em foco')
})
