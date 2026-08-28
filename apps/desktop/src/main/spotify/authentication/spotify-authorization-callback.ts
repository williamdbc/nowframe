import { createServer } from 'node:http'
import type { Server, ServerResponse } from 'node:http'

const authorizationTimeoutMs = 3 * 60 * 1000

export class SpotifyAuthorizationCancelledError extends Error {
  constructor() {
    super('A autorização do Spotify foi cancelada.')
    this.name = 'SpotifyAuthorizationCancelledError'
  }
}

interface WaitForSpotifyAuthorizationCodeOptions {
  redirectUri: string
  expectedState: string
  onListening: () => Promise<void>
}

function sendCallbackPage(response: ServerResponse, title: string, message: string): void {
  response.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'",
    Connection: 'close'
  })
  response.end(`<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #08090a; color: #fff; font-family: system-ui, sans-serif; }
      main { max-width: 36rem; padding: 3rem; text-align: center; }
      h1 { margin: 0 0 1rem; font-size: 2rem; }
      p { margin: 0; color: rgba(255,255,255,.62); line-height: 1.6; }
    </style>
  </head>
  <body><main><h1>${title}</h1><p>${message}</p></main></body>
</html>`)
}

function listen(server: Server, hostname: string, port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(port, hostname, () => {
      server.removeListener('error', reject)
      resolve()
    })
  })
}

function close(server: Server): Promise<void> {
  if (!server.listening) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const forceCloseTimeout = setTimeout(() => server.closeAllConnections(), 1000)

    server.close((error) => {
      clearTimeout(forceCloseTimeout)
      if (error) reject(error)
      else resolve()
    })
    server.closeIdleConnections()
  })
}

export async function waitForSpotifyAuthorizationCode({
  redirectUri,
  expectedState,
  onListening
}: WaitForSpotifyAuthorizationCodeOptions): Promise<string> {
  const redirectUrl = new URL(redirectUri)
  const port = Number(redirectUrl.port)
  let isSettled = false
  let resolveAuthorization!: (code: string) => void
  let rejectAuthorization!: (error: Error) => void

  const authorizationCode = new Promise<string>((resolve, reject) => {
    resolveAuthorization = resolve
    rejectAuthorization = reject
  })

  const server = createServer((request, response) => {
    if (request.method !== 'GET' || !request.url) {
      response.writeHead(405).end()
      return
    }

    const callbackUrl = new URL(request.url, redirectUrl.origin)

    if (callbackUrl.pathname !== redirectUrl.pathname) {
      response.writeHead(404).end()
      return
    }

    if (isSettled) {
      response.writeHead(410).end()
      return
    }

    isSettled = true
    const returnedState = callbackUrl.searchParams.get('state')
    const authorizationError = callbackUrl.searchParams.get('error')

    if (returnedState !== expectedState) {
      sendCallbackPage(
        response,
        'Não foi possível conectar',
        'A validação de segurança falhou. Volte ao Nowframe e tente novamente.'
      )
      rejectAuthorization(new Error('A validação de segurança do login Spotify falhou.'))
      return
    }

    if (authorizationError) {
      sendCallbackPage(
        response,
        'Autorização cancelada',
        'Você pode fechar esta aba e voltar ao Nowframe.'
      )
      rejectAuthorization(new SpotifyAuthorizationCancelledError())
      return
    }

    const code = callbackUrl.searchParams.get('code')

    if (!code) {
      sendCallbackPage(
        response,
        'Não foi possível conectar',
        'O Spotify não retornou um código de autorização válido.'
      )
      rejectAuthorization(new Error('O Spotify não retornou um código de autorização.'))
      return
    }

    sendCallbackPage(
      response,
      'Spotify conectado',
      'Você pode fechar esta aba e voltar ao Nowframe.'
    )
    resolveAuthorization(code)
  })

  await listen(server, redirectUrl.hostname, port)
  const timeoutId = setTimeout(() => {
    if (isSettled) return
    isSettled = true
    rejectAuthorization(new Error('O tempo para autorizar o Spotify terminou. Tente novamente.'))
  }, authorizationTimeoutMs)

  try {
    await onListening()
    return await authorizationCode
  } finally {
    clearTimeout(timeoutId)
    await close(server)
  }
}
