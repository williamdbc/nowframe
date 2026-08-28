/**
 * Janela de espera pedida pelo Spotify depois de um 429.
 *
 * O gate vale só para as consultas periódicas. Comandos disparados pela pessoa passam
 * direto: antes, um único 429 no polling deixava play, pause e skip mortos por no mínimo
 * 30 segundos, o que lê como app travado. Um comando a mais durante a janela é preferível
 * a um botão que não responde — e comandos são raros perto do volume do polling.
 *
 * Sem cabeçalho `Retry-After` utilizável, a espera cresce por tentativa em vez de assumir
 * 30 segundos de cara.
 */
const progressiveRetryDelaysMs = [2_000, 5_000, 15_000, 30_000] as const

let rateLimitedUntil = 0
let consecutiveRateLimits = 0

function parseRetryAfterMs(retryAfterHeader: string | null): number | null {
  const retryAfterSeconds = Number(retryAfterHeader)
  return Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
    ? retryAfterSeconds * 1000
    : null
}

export function getRateLimitDelayMs(retryAfterHeader: string | null, attempt: number): number {
  const retryAfterMs = parseRetryAfterMs(retryAfterHeader)
  if (retryAfterMs !== null) return retryAfterMs

  const index = Math.min(attempt, progressiveRetryDelaysMs.length - 1)
  return progressiveRetryDelaysMs[index]
}

export function noteRateLimited(retryAfterHeader: string | null): void {
  const delayMs = getRateLimitDelayMs(retryAfterHeader, consecutiveRateLimits)
  consecutiveRateLimits += 1
  rateLimitedUntil = Date.now() + delayMs
}

export function noteRequestSucceeded(): void {
  consecutiveRateLimits = 0
  rateLimitedUntil = 0
}

export function isRateLimited(): boolean {
  return Date.now() < rateLimitedUntil
}

/** Apenas para testes: o estado é de módulo e de outra forma atravessa casos. */
export function resetRateLimitState(): void {
  rateLimitedUntil = 0
  consecutiveRateLimits = 0
}
