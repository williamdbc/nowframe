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

- `main` possui capacidades do sistema operacional, executa o OAuth e mantém os tokens Spotify.
- `preload` expõe apenas operações explícitas via `contextBridge`.
- `renderer` não acessa Node.js, Electron, tokens ou a Spotify Web API diretamente.
- O Client Secret não faz parte da aplicação desktop. OAuth utiliza Authorization Code com PKCE.
- O perfil público é carregado pelo processo principal e reduzido aos campos usados pela interface.
- A sessão é criptografada com `safeStorage` e persistida no diretório de dados do aplicativo.

## Renderer

```text
src/renderer/src
  features/
    app-bootstrap/
    authentication/
    playback/
    themes/
    window-controls/
  routes/
  shared/
```

Rotas apenas conectam URL e páginas. Estado assíncrono usa TanStack Query; chamadas IPC ficam encapsuladas em services. Componentes e tipos permanecem em suas features até existir reutilização real.

O renderer usa hash history (`#/` e `#/login`) porque a aplicação empacotada é carregada pelo protocolo `file://`.

## Navegação atual

- `/` exibe o player e sua barra de ações apenas com uma sessão Spotify válida.
- `/login` inicia a conexão Spotify via PKCE.
- O layout pathless `_authenticated` consulta a sessão no processo principal e protege o display.
- Login e logout atualizam o cache da sessão e redirecionam entre as duas rotas.
- O seletor de temas permanece sobre o display; uma página de configurações só será criada quando houver preferências suficientes.

## Autenticação Spotify

O processo `main` cria o verifier, challenge e state do PKCE, inicia temporariamente o callback em `127.0.0.1:8888`, abre o navegador padrão e troca o authorization code por tokens. Os scopes ficam definidos em `spotify-scopes.ts` e atualmente permitem identificar o perfil, ler e controlar a reprodução.

O access token é renovado antes de expirar. Um refresh token expirado, revogado ou sem os scopes atuais remove a sessão local e exige nova autorização. O renderer recebe por IPC apenas o estado da sessão e os campos públicos de perfil usados pelo menu; tokens permanecem no processo principal.

## Modo apresentação

O renderer solicita fullscreen por uma API tipada do preload. O processo `main` controla a `BrowserWindow` e publica as transições de entrada e saída para manter a interface sincronizada. Em fullscreen, a barra de ações desaparece e `ESC` encerra o modo apresentação.

## Evolução

Quando necessário, novas aplicações entram em `apps/web` e `apps/api`. Uma pasta compartilhada na raiz só será criada depois que desktop e web tiverem código comprovadamente reutilizável.
