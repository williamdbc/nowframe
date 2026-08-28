import { describe, expect, it } from 'vitest'

import { projectAnchor, readPosition, reconcileAnchor } from './playback-clock'

const anchor = {
  durationMs: 200_000,
  isPlaying: true,
  itemKey: 'track:a',
  progressMs: 30_000,
  synchronizedAt: 1_000_000
}

const now = { epochMs: 1_000_000, monotonicMs: 5_000 }

describe('projectAnchor', () => {
  it('projects the transport lag between the server instant and receipt', () => {
    const state = projectAnchor(anchor, { epochMs: 1_000_200, monotonicMs: 5_000 })

    expect(state.positionMs).toBe(30_200)
    expect(state.monotonicAt).toBe(5_000)
  })

  it('does not advance a paused position', () => {
    const state = projectAnchor(
      { ...anchor, isPlaying: false },
      { epochMs: 1_000_200, monotonicMs: 5_000 }
    )

    expect(state.positionMs).toBe(30_000)
  })

  it('never projects past the end of the content', () => {
    const state = projectAnchor(
      { ...anchor, progressMs: 199_900 },
      { epochMs: 1_000_500, monotonicMs: 5_000 }
    )

    expect(state.positionMs).toBe(200_000)
  })
})

describe('readPosition', () => {
  it('advances with the monotonic clock while playing', () => {
    const state = projectAnchor(anchor, now)

    expect(readPosition(state, 5_400)).toBe(30_400)
  })

  it('holds still while paused', () => {
    const state = projectAnchor({ ...anchor, isPlaying: false }, now)

    expect(readPosition(state, 9_000)).toBe(30_000)
  })
})

describe('reconcileAnchor', () => {
  it('snaps when the content changed', () => {
    const state = projectAnchor(anchor, now)
    const next = reconcileAnchor(
      state,
      { ...anchor, itemKey: 'track:b', progressMs: 0, synchronizedAt: 1_000_000 },
      { epochMs: 1_000_000, monotonicMs: 5_000 }
    )

    expect(next.positionMs).toBe(0)
  })

  it('snaps when play or pause changed', () => {
    const state = projectAnchor(anchor, now)
    const next = reconcileAnchor(
      state,
      { ...anchor, isPlaying: false, progressMs: 31_000 },
      { epochMs: 1_000_000, monotonicMs: 5_000 }
    )

    expect(next.positionMs).toBe(31_000)
  })

  it('snaps on a difference large enough to be a seek', () => {
    const state = projectAnchor(anchor, now)
    const next = reconcileAnchor(
      state,
      { ...anchor, progressMs: 90_000, synchronizedAt: 1_000_000 },
      { epochMs: 1_000_000, monotonicMs: 5_000 }
    )

    expect(next.positionMs).toBe(90_000)
  })

  /**
   * O caso que motiva a convergência: o `progress_ms` do Spotify chega com atraso variável
   * de 0 a ~1 s, então uma resposta pode implicar posição menor que a estimativa local.
   * Re-ancorar duro fazia a barra andar para trás e a letra voltar uma linha.
   */
  it('absorbs a small regression instead of jumping backwards', () => {
    const state = projectAnchor(anchor, now)
    const currentPositionMs = readPosition(state, 6_000)
    expect(currentPositionMs).toBe(31_000)

    const next = reconcileAnchor(
      state,
      { ...anchor, progressMs: 30_400, synchronizedAt: 1_001_000 },
      { epochMs: 1_001_000, monotonicMs: 6_000 }
    )

    // A verdade do servidor implicava 30_400; a estimativa local estava em 31_000.
    // A posição cede parte da diferença em vez de saltar, e nunca retrocede até o valor cru.
    expect(next.positionMs).toBeGreaterThan(30_400)
    expect(next.positionMs).toBeLessThan(currentPositionMs)
  })

  it('converges towards the server position over repeated corrections', () => {
    let state = projectAnchor(anchor, now)
    let monotonicMs = 5_000

    // A verdade do servidor corre 600 ms atrás da estimativa local, repetidamente.
    for (let correction = 0; correction < 12; correction += 1) {
      monotonicMs += 1_000
      state = reconcileAnchor(
        state,
        {
          ...anchor,
          progressMs: 30_000 + (monotonicMs - 5_000) - 600,
          synchronizedAt: 1_000_000 + (monotonicMs - 5_000)
        },
        { epochMs: 1_000_000 + (monotonicMs - 5_000), monotonicMs }
      )
    }

    const serverPositionMs = 30_000 + (monotonicMs - 5_000) - 600
    expect(Math.abs(readPosition(state, monotonicMs) - serverPositionMs)).toBeLessThan(150)
  })
})
