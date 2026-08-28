import type { PlaybackState } from '../types/playback-state'

/**
 * Guarda contra resposta velha do Spotify depois de um comando nosso.
 *
 * O `/me/player` é eventualmente consistente: por até cerca de um segundo depois de um
 * skip ou de um toggle, ele ainda relata o estado anterior. Como o polling de 1 s escreve
 * no cache o que vier, o estado otimista era sobrescrito pelo valor velho e depois
 * corrigido de novo no ciclo seguinte. Isso aparecia de duas formas:
 *
 * - aleatório e repetir voltavam ao estado anterior e piscavam;
 * - ao pular faixa, o `trackKey` do tema oscilava entre a faixa nova e a antiga, e cada
 *   troca remontava a seção inteira, reiniciando as animações de entrada.
 *
 * Aqui um comando registra o que espera ver. Enquanto a expectativa não vence, respostas
 * que a contradizem são descartadas em vez de escritas. O TTL é a válvula de escape: se o
 * Spotify nunca confirmar, a verdade do servidor volta a valer.
 */
const expectationTimeToLiveMs = 2_500

interface PlaybackExpectation {
  expiresAt: number
  isSatisfiedBy: (playback: PlaybackState) => boolean
}

let expectation: PlaybackExpectation | null = null

export function expectPlayback(
  isSatisfiedBy: (playback: PlaybackState) => boolean,
  now: number = Date.now()
): void {
  expectation = { expiresAt: now + expectationTimeToLiveMs, isSatisfiedBy }
}

export function clearPlaybackExpectation(): void {
  expectation = null
}

/**
 * Só descarta quando há uma expectativa viva que a resposta contradiz. Uma resposta que
 * satisfaz a expectativa a encerra: daí em diante o servidor volta a mandar.
 */
export function shouldDiscardPlayback(
  playback: PlaybackState | null,
  now: number = Date.now()
): boolean {
  if (!expectation) return false

  if (now >= expectation.expiresAt) {
    expectation = null
    return false
  }

  if (!playback) return false

  if (expectation.isSatisfiedBy(playback)) {
    expectation = null
    return false
  }

  return true
}
