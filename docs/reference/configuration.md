# Referência de configuração

## Variáveis de ambiente

Arquivo de exemplo: `apps/desktop/.env.example`. Para desenvolvimento, copie para `.env.local` no mesmo diretório.

| Variável                         | Obrigatória | Padrão                           | Consumidor    | Descrição                                              |
| -------------------------------- | ----------- | -------------------------------- | ------------- | ------------------------------------------------------ |
| `MAIN_VITE_SPOTIFY_CLIENT_ID`    | Sim         | —                                | Processo main | Identificador público do aplicativo Spotify.           |
| `MAIN_VITE_SPOTIFY_REDIRECT_URI` | Não         | `http://127.0.0.1:8888/callback` | Processo main | Callback loopback com HTTP, porta explícita e caminho. |

O schema aceita somente loopback `127.0.0.1` ou `[::1]`, porta explícita e caminho não vazio. O valor precisa corresponder exatamente a uma Redirect URI cadastrada no Spotify Dashboard.

`MAIN_VITE_*` é a convenção usada pelo Electron Vite para variáveis embutidas no processo main. Não adicione Client Secret: builds desktop são clientes públicos e não conseguem protegê-lo.

## Scopes Spotify

Fonte: `src/main/spotify/authentication/spotify-scopes.ts`.

| Scope                        | Uso atual                                                 |
| ---------------------------- | --------------------------------------------------------- |
| `user-read-private`          | Perfil da conta e estado necessário ao fluxo autenticado. |
| `user-read-playback-state`   | Conteúdo atual, dispositivo, progresso, volume e opções.  |
| `user-modify-playback-state` | Transporte, seek, volume, aleatório e repetição.          |
| `playlist-read-private`      | Tracklist de playlists privadas permitidas à conta.       |
| `user-library-read`          | Estado de favorito do conteúdo atual.                     |
| `user-library-modify`        | Adicionar e remover conteúdo da biblioteca.               |

Adicionar ou remover scope invalida sessões antigas pelo verificador de scopes. Depois da mudança, faça logout e autorize novamente.

## Persistência local

| Dado                  | Local                                                             | Proteção e ciclo de vida                                                                                                                |
| --------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Sessão Spotify        | Arquivo `spotify-session.enc` dentro de `app.getPath('userData')` | JSON cifrado por `safeStorage`, gravado via arquivo temporário e permissão `0600`; removido no logout ou ao detectar conteúdo inválido. |
| Tema ativo            | `localStorage['nowframe:selected-theme']`                         | Valor não sensível; IDs desconhecidos voltam para `default`.                                                                            |
| Último volume audível | Memória do renderer                                               | Não persiste após fechar; usado apenas para restaurar mudo.                                                                             |
| Cache de queries      | Memória do renderer                                               | Recriado a cada inicialização.                                                                                                          |

Tokens nunca atravessam o preload. O contrato `NowframeApi` expõe apenas estado e operações reduzidos.

## Configuração da janela

Fonte: `src/main/windows/create-main-window.ts`.

| Propriedade        | Valor atual            |
| ------------------ | ---------------------- |
| Tamanho inicial    | 1280×720               |
| Tamanho mínimo     | 900×540                |
| Título             | Nowframe               |
| Menu               | Oculto automaticamente |
| `contextIsolation` | `true`                 |
| `nodeIntegration`  | `false`                |
| Sandbox            | `true`                 |

Somente URLs HTTPS podem ser encaminhadas ao navegador padrão; a criação de novas janelas no renderer é negada.

## Empacotamento

Fonte: `apps/desktop/electron-builder.yml`.

| Campo              | Valor atual                   |
| ------------------ | ----------------------------- |
| App ID             | `app.nowframe.desktop`        |
| Product name       | `Nowframe`                    |
| Executável Windows | `nowframe`                    |
| Categoria Linux    | `Utility`                     |
| Notarização macOS  | Desativada                    |
| Publicação         | Provider genérico placeholder |

Os arquivos `.env*`, configs de desenvolvimento, source e documentação são excluídos do pacote pelo Electron Builder. As variáveis `MAIN_VITE_*` usadas pelo código são resolvidas no build.

## Integrações externas

| Serviço          | Base/endpoint                  | Timeout explícito | Observação                                                  |
| ---------------- | ------------------------------ | ----------------: | ----------------------------------------------------------- |
| Spotify Accounts | `https://accounts.spotify.com` | Dispatcher global | Autorização e refresh PKCE.                                 |
| Spotify Web API  | `https://api.spotify.com/v1`   | Dispatcher global | Playback, perfil, biblioteca, álbum e playlist.             |
| LRCLIB           | `https://lrclib.net/api/get`   |        8 segundos | Letra simples, por linha e, quando disponível, por palavra. |

O dispatcher global mantém conexões vivas e limita conexão, headers e corpo. Valores exatos ficam em `src/main/config/http-dispatcher.ts`, que é a fonte de verdade operacional.

## Feature flags locais

| Flag                       | Valor atual | Efeito                                                |
| -------------------------- | ----------- | ----------------------------------------------------- |
| `showUnsynchronizedLyrics` | `false`     | O tema Lyrics não mostra texto sem sincronização.     |
| `karaokeLyricsLeadMs`      | `500`       | Karaoke adianta a frase em meio segundo para leitura. |

Essas flags são constantes de código, não variáveis de ambiente nem preferências de usuário.

## Documentos relacionados

- [Desenvolvimento local](../development/local-setup.md)
- [Sincronização e integrações](../architecture/playback-and-integrations.md)
- [Gerar builds desktop](../guides/build-desktop.md)
