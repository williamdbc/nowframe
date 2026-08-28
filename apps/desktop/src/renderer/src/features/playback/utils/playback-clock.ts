/**
 * Relógio de posição da reprodução.
 *
 * Três problemas que o cálculo anterior tinha:
 *
 * 1. Media o tempo decorrido com `Date.now()`, que é relógio de parede: um ajuste de NTP
 *    ou um sleep/resume fazia a posição saltar.
 * 2. Re-ancorava duro a cada resposta do Spotify. Como o `progress_ms` chega com atraso
 *    variável de 0 a ~1 s, duas respostas consecutivas podem implicar uma posição MENOR
 *    que a estimativa local — a barra andava para trás e a letra voltava uma linha.
 * 3. Ficava preso na cadência de quem o consumia (250 ms), somada a um segundo relógio de
 *    100 ms na letra.
 *
 * Aqui a posição avança em `performance.now()` (monotônico) a partir de uma âncora, e as
 * correções do servidor entram por convergência suave: diferenças pequenas são absorvidas
 * ao longo de alguns ticks em vez de virar salto, e só um seek ou troca de faixa de fato
 * reposiciona na hora.
 */

/** Acima disto, a diferença é um seek ou troca de conteúdo, não staleness do servidor. */
const hardSnapThresholdMs = 1_500

/** Fração da diferença absorvida por correção. Converge sem salto visível. */
const convergenceRate = 0.2

export interface PlaybackClockAnchor {
  durationMs: number
  isPlaying: boolean
  itemKey: string | null
  /** Posição relatada pelo servidor, já compensada de RTT/2 no processo main. */
  progressMs: number
  /** Instante (epoch) a que `progressMs` se refere. */
  synchronizedAt: number
}

interface ClockState {
  durationMs: number
  isPlaying: boolean
  itemKey: string | null
  /** Posição no instante `monotonicAt`. */
  positionMs: number
  monotonicAt: number
}

export interface PlaybackClockNow {
  epochMs: number
  monotonicMs: number
}

/**
 * Converte uma âncora do servidor em estado local, projetando o atraso de transporte:
 * `progressMs` valia em `synchronizedAt`, e já se passou algum tempo desde então.
 */
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

/**
 * Funde uma âncora nova no estado corrente. Troca de conteúdo, mudança de play/pause e
 * diferenças grandes reposicionam na hora; o resto converge por fração.
 */
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

/**
 * O loop de rAF só existe enquanto há ouvinte e a reprodução está tocando, então uma tela
 * pausada ou sem ninguém observando não custa nada.
 */
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
