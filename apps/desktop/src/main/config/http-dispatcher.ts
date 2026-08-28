import { Agent, setGlobalDispatcher } from 'undici'

/**
 * O `fetch` global do processo main usa o dispatcher global do undici, então ajustá-lo aqui
 * vale para todas as chamadas HTTP do main sem tocar em nenhum call site.
 *
 * Dois motivos, ambos medidos contra `api.spotify.com`:
 *
 * - O handshake TCP+TLS custa 57–66 ms, contra 155–260 ms de uma requisição em socket
 *   quente. Com o `keepAliveTimeout` padrão de 4 s, o socket morre sempre que o polling
 *   para (a janela sai de foco), e a primeira ação ao voltar paga o handshake inteiro.
 * - Com `connections` ilimitado, um comando disparado enquanto o polling está em voo abre
 *   um socket novo e frio em vez de reaproveitar um quente. Um pool pequeno mantém alguns
 *   sockets aquecidos para exatamente esse caso.
 *
 * Os timeouts são uma rede de segurança: sem eles, um socket travado pendura o polling
 * indefinidamente e a UI congela em dado velho sem nunca reportar erro. Ficam acima do
 * timeout por chamada do cliente de letras (8 s) para não atropelá-lo.
 */
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
