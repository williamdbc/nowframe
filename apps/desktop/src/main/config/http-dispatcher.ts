import { Agent, setGlobalDispatcher } from 'undici'

const keepAliveTimeoutMs = 60_000
const keepAliveMaximumTimeoutMs = 600_000
const maximumConnectionsPerOrigin = 4
const stalledRequestTimeoutMs = 10_000

export function configureHttpDispatcher(): void {
  setGlobalDispatcher(
    new Agent({
      connections: maximumConnectionsPerOrigin,
      keepAliveTimeout: keepAliveTimeoutMs,
      keepAliveMaxTimeout: keepAliveMaximumTimeoutMs,
      headersTimeout: stalledRequestTimeoutMs,
      bodyTimeout: stalledRequestTimeoutMs
    })
  )
}
