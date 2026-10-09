const progressiveRetryDelaysMs = [2_000, 5_000, 15_000, 30_000] as const

let rateLimitedUntil = 0
let consecutiveRateLimits = 0

export interface SpotifyRateLimitWindow {
  delayMs: number
  retryAt: number
  source: 'fallback' | 'header'
}

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

export function noteRateLimited(retryAfterHeader: string | null): SpotifyRateLimitWindow {
  const source = parseRetryAfterMs(retryAfterHeader) === null ? 'fallback' : 'header'
  const delayMs = getRateLimitDelayMs(retryAfterHeader, consecutiveRateLimits)
  const now = Date.now()
  consecutiveRateLimits += 1
  rateLimitedUntil = Math.max(rateLimitedUntil, now + delayMs)

  return { delayMs: rateLimitedUntil - now, retryAt: rateLimitedUntil, source }
}

export function noteRequestSucceeded(): void {
  consecutiveRateLimits = 0

  if (Date.now() >= rateLimitedUntil) rateLimitedUntil = 0
}

export function isRateLimited(): boolean {
  return Date.now() < rateLimitedUntil
}

export function getRateLimitRemainingMs(): number {
  return Math.max(0, rateLimitedUntil - Date.now())
}

export function resetRateLimitState(): void {
  rateLimitedUntil = 0
  consecutiveRateLimits = 0
}
