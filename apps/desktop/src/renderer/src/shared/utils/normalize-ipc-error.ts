export function normalizeIpcError(error: unknown, fallbackMessage: string): Error {
  if (!(error instanceof Error)) return new Error(fallbackMessage)

  const message = error.message.replace(/^Error invoking remote method '[^']+': (?:Error: )?/, '')
  return new Error(message)
}
