# ADR 0002: PKCE e fronteira entre processos Electron

- **Status:** Aceita
- **Data:** 2026-08-28

## Contexto

O Nowframe precisa acessar perfil, biblioteca e player em nome da pessoa. Um aplicativo desktop distribuído não consegue manter Client Secret confidencial: qualquer valor empacotado pode ser extraído. Também não é aceitável entregar access token, refresh token ou capacidades Node.js ao renderer React.

## Decisão

Usar Authorization Code com PKCE e concentrar autenticação e integrações no processo main.

- O ambiente recebe somente Client ID e redirect URI loopback.
- O main gera verifier, challenge S256 e `state`, abre o navegador padrão e escuta temporariamente o callback em `127.0.0.1`.
- Tokens são trocados e renovados no main e persistidos cifrados com `safeStorage` em arquivo de permissão `0600`.
- O preload expõe uma API mínima via `contextBridge`; renderer e main compartilham contratos tipados.
- A `BrowserWindow` usa `contextIsolation: true`, `nodeIntegration: false` e `sandbox: true`.
- Entradas IPC são validadas no main e respostas externas são validadas antes de mapear para o domínio.

## Alternativas consideradas

### Authorization Code com Client Secret no desktop

Rejeitada porque o segredo não permaneceria secreto após distribuição.

### Fluxo implícito

Rejeitado por não oferecer refresh token adequado e por não ser o fluxo recomendado para clientes públicos.

### Chamar Spotify diretamente do renderer

Rejeitada porque ampliaria a superfície de ataque, exporia tokens ao contexto da UI e acoplaria componentes visuais a contratos externos.

## Consequências

- Client Secret nunca deve ser solicitado, documentado ou armazenado pelo Nowframe.
- Login abre uma janela externa e depende de um callback loopback exato no Spotify Dashboard.
- O renderer recebe apenas o estado mínimo necessário e não consegue escapar da API permitida pelo preload.
- Uma futura versão web precisará decidir sua própria fronteira de autenticação; não deve copiar automaticamente o armazenamento desktop.

## Referências

- [Authorization Code with PKCE — Spotify](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow)
- [Visão geral da arquitetura](../architecture/overview.md)
- [Referência de configuração](../reference/configuration.md)
