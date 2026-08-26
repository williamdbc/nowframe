# Arquitetura

## Escopo atual

O Music Display começa como uma aplicação desktop pessoal. O Spotify oficial continua responsável pelo áudio; o aplicativo exibe o estado da reprodução em um layout landscape.

```text
apps/desktop
  src/main       Electron, OAuth, tokens, Spotify Web API e janela
  src/preload    ponte IPC mínima e tipada
  src/contracts  contratos compartilhados entre processos
  src/renderer   React, rotas, queries, features e temas
```

## Limites dos processos

- `main` possui capacidades do sistema operacional e, futuramente, os tokens Spotify.
- `preload` expõe apenas operações explícitas via `contextBridge`.
- `renderer` não acessa Node.js, Electron, tokens ou a Spotify Web API diretamente.
- O Client Secret não faz parte da aplicação desktop. OAuth utilizará Authorization Code com PKCE.

## Renderer

```text
src/renderer/src
  features/
    app-bootstrap/
    authentication/
    playback/
    themes/
  routes/
  shared/
```

Rotas apenas conectam URL e páginas. Estado assíncrono usa TanStack Query; chamadas IPC ficam encapsuladas em services. Componentes e tipos permanecem em suas features até existir reutilização real.

O renderer usa hash history (`#/` e `#/login`) porque a aplicação empacotada é carregada pelo protocolo `file://`.

## Navegação atual

- `/` exibe o player e sua barra de ações.
- `/login` apresenta a futura conexão Spotify via PKCE.
- A proteção automática do display será adicionada somente quando existir uma sessão Spotify real e confiável.
- O seletor de temas permanece sobre o display; uma página de configurações só será criada quando houver preferências suficientes.

## Modo apresentação

O renderer solicita fullscreen por uma API tipada do preload. O processo `main` controla a `BrowserWindow` e publica as transições de entrada e saída para manter a interface sincronizada. Em fullscreen, a barra de ações desaparece e `ESC` encerra o modo apresentação.

## Evolução

Quando necessário, novas aplicações entram em `apps/web` e `apps/api`. Uma pasta compartilhada na raiz só será criada depois que desktop e web tiverem código comprovadamente reutilizável.
