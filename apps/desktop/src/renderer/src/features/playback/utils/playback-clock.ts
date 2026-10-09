const hardSnapThresholdMs = 1_500

const convergenceRate = 0.2

export interface PlaybackClockAnchor {
  durationMs: number
  isPlaying: boolean
  itemKey: string | null

  progressMs: number

  synchronizedAt: number
}

interface ClockState {
  durationMs: number
  isPlaying: boolean
  itemKey: string | null

  positionMs: number
  monotonicAt: number
}

export interface PlaybackClockNow {
  epochMs: number
  monotonicMs: number
}

export function projectAnchor(anchor: PlaybackClockAnchor, now: PlaybackClockNow): ClockState {
  const transportLagMs = anchor.isPlaying ? Math.max(0, now.epochMs - anchor.synchronizedAt) : 0

  return {
    durationMs: anchor.durationMs,
    isPlaying: anchor.isPlaying,
    itemKey: anchor.itemKey,
    positionMs: Math.min(anchor.durationMs, anchor.progressMs + transportLagMs),
    monotonicAt: now.monotonicMs
  }
}

export function readPosition(state: ClockState, monotonicMs: number): number {
  if (!state.isPlaying) return state.positionMs

  const elapsedMs = Math.max(0, monotonicMs - state.monotonicAt)
  return Math.min(state.durationMs, state.positionMs + elapsedMs)
}

export function reconcileAnchor(
  state: ClockState | null,
  anchor: PlaybackClockAnchor,
  now: PlaybackClockNow
): ClockState {
  const projected = projectAnchor(anchor, now)

  if (
    !state ||
    state.itemKey !== anchor.itemKey ||
    state.isPlaying !== anchor.isPlaying ||
    !anchor.isPlaying
  ) {
    return projected
  }

  const currentPositionMs = readPosition(state, now.monotonicMs)
  const differenceMs = projected.positionMs - currentPositionMs

  if (Math.abs(differenceMs) >= hardSnapThresholdMs) return projected

  return {
    ...projected,
    positionMs: Math.min(
      projected.durationMs,
      Math.max(0, currentPositionMs + differenceMs * convergenceRate)
    )
  }
}

type PlaybackClockListener = () => void

function readNow(): PlaybackClockNow {
  return { epochMs: Date.now(), monotonicMs: performance.now() }
}

export class PlaybackClock {
  private state: ClockState | null = null
  private readonly listeners = new Set<PlaybackClockListener>()
  private frameId: number | null = null

  setAnchor(anchor: PlaybackClockAnchor | null): void {
    if (!anchor) {
      this.state = null
      this.stopTicking()
      return
    }

    this.state = reconcileAnchor(this.state, anchor, readNow())
    this.notify()
    this.synchronizeTicking()
  }

  hasAnchor(): boolean {
    return this.state !== null
  }

  getPositionMs(): number {
    return this.state ? readPosition(this.state, performance.now()) : 0
  }

  getDurationMs(): number {
    return this.state?.durationMs ?? 0
  }

  subscribe(listener: PlaybackClockListener): () => void {
    this.listeners.add(listener)
    this.synchronizeTicking()

    return () => {
      this.listeners.delete(listener)
      this.synchronizeTicking()
    }
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener())
  }

  private synchronizeTicking(): void {
    const shouldTick = Boolean(this.state?.isPlaying) && this.listeners.size > 0

    if (shouldTick) this.startTicking()
    else this.stopTicking()
  }

  private startTicking(): void {
    if (this.frameId !== null || typeof requestAnimationFrame !== 'function') return

    const tick = (): void => {
      this.frameId = null
      this.notify()
      this.synchronizeTicking()
    }

    this.frameId = requestAnimationFrame(tick)
  }

  private stopTicking(): void {
    if (this.frameId === null) return

    cancelAnimationFrame(this.frameId)
    this.frameId = null
  }
}

export const playbackClock = new PlaybackClock()
