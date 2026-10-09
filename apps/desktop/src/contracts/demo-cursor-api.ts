export const demoCursorChannels = {
  prepare: 'demo:cursor-prepare',
  move: 'demo:cursor-move',
  click: 'demo:cursor-click',
  stop: 'demo:cursor-stop'
} as const

export interface DemoCursorApi {
  prepare: () => Promise<void>
  move: (x: number, y: number, durationMs: number) => Promise<void>
  click: (x: number, y: number) => Promise<void>
  stop: () => Promise<void>
}
