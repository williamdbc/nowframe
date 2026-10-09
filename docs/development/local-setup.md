# Desenvolvimento local

## Pré-requisitos

- Git, Node.js 22.12 ou superior e npm.
- Uma conta Spotify e acesso ao [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
- Um aplicativo Spotify em Development Mode ou outro modo compatível.
- Um dispositivo Spotify capaz de iniciar uma reprodução para testar o controle remoto.

No Development Mode, o proprietário do aplicativo precisa ter Spotify Premium ativo. Atualmente, até cinco usuários autenticados podem usar o aplicativo e cada usuário de teste precisa estar na allowlist. Consulte [Quota modes](https://developer.spotify.com/documentation/web-api/concepts/quota-modes), porque limites e critérios podem mudar.

## Configurar o Spotify Dashboard

1. Crie seu próprio aplicativo no [Developer Dashboard](https://developer.spotify.com/dashboard), usando **Create app**, ou abra um aplicativo existente. Preencha nome e descrição à sua escolha.
2. Em Redirect URIs, adicione exatamente:

   ```text
   http://127.0.0.1:8888/callback
   ```

3. Em **Which API/SDKs are you planning to use?**, marque **Web API**. O **Web Playback SDK** não é usado pela versão atual; pode continuar marcado em um aplicativo existente, mas não é necessário para o Nowframe.
4. Deixe **Bundle IDs** e **Android packages** vazios. Esses campos pertencem às integrações com os SDKs de iOS e Android, não à aplicação Electron.
5. Aceite os termos e salve. Confira em **Settings → Users Management** se a conta que fará login está autorizada; adicione as contas de outras pessoas caso compartilhe o mesmo Client ID em Development Mode.
6. Copie o **Client ID** nas configurações do app. Não copie nem compartilhe o **Client Secret** com o Nowframe: o login usa PKCE.

O redirect usa loopback HTTP porque o callback acontece na máquina local. `localhost`, outra porta, barra final diferente ou caminho diferente não correspondem à configuração padrão. A configuração segue as [regras de Redirect URIs do Spotify](https://developer.spotify.com/documentation/web-api/concepts/redirect_uri).

Se o seu Dashboard já usa `http://127.0.0.1:3000/callback`, você pode manter essa URI, configurando o mesmo valor em `MAIN_VITE_SPOTIFY_REDIRECT_URI`. A porta escolhida deve estar livre durante o login. O próprio Nowframe inicia o servidor do callback; não é preciso criar um servidor separado.

Quotas de Development Mode são contabilizadas por conta de desenvolvedor, não por Client ID. Criar vários aplicativos na mesma conta continua consumindo o mesmo orçamento. Para trabalho simultâneo sem compartilhar a quota, cada colaborador pode criar seu aplicativo Spotify em sua própria conta de desenvolvedor e configurar o Client ID localmente.

## Instalar e executar

Na raiz do repositório:

```bash
npm --prefix apps/desktop install
cp apps/desktop/.env.example apps/desktop/.env.local
```

No Windows com PowerShell, use `Copy-Item apps/desktop/.env.example apps/desktop/.env.local` no lugar de `cp`.

Edite `apps/desktop/.env.local`:

```dotenv
MAIN_VITE_SPOTIFY_CLIENT_ID=seu_client_id
MAIN_VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:8888/callback
```

Inicie:

```bash
npm --prefix apps/desktop run dev
```

O arquivo `.env.local` é ignorado pelo Git. Reinicie o processo de desenvolvimento sempre que alterar variáveis carregadas pelo Electron Vite.

## Primeiro login

1. Abra o Nowframe e selecione a conexão com Spotify.
2. O navegador padrão abrirá a autorização.
3. Aceite os scopes solicitados.
4. O navegador retorna ao callback local e o aplicativo segue para o display.
5. Inicie uma faixa em um cliente Spotify caso ainda não exista dispositivo ativo.

A sessão é renovada automaticamente. Logout remove o arquivo cifrado local; revogação, refresh token inválido ou scopes antigos também exigem novo login.

## Scripts

Execute dentro de `apps/desktop` ou use `npm --prefix apps/desktop` a partir da raiz.

| Comando                | Uso                                                       |
| ---------------------- | --------------------------------------------------------- |
| `npm run dev`          | Inicia main, preload e renderer em desenvolvimento.       |
| `npm run format`       | Aplica Prettier.                                          |
| `npm run format:check` | Verifica formatação sem alterar arquivos.                 |
| `npm run typecheck`    | Gera a árvore de rotas e valida TypeScript dos processos. |
| `npm run lint`         | Executa ESLint.                                           |
| `npm test`             | Executa a suíte Vitest uma vez.                           |
| `npm run test:watch`   | Mantém Vitest em observação.                              |
| `npm run build`        | Valida tipos e produz `out/` sem empacotar instalador.    |
| `npm run build:unpack` | Gera uma aplicação descompactada para inspeção local.     |
| `npm run build:mac`    | Gera os artefatos configurados para macOS.                |
| `npm run build:win`    | Gera o instalador NSIS do Windows.                        |
| `npm run build:linux`  | Gera AppImage, Snap e DEB.                                |

Antes de enviar mudanças, execute:

```bash
npm run format:check
npm run typecheck
npm run lint
npm test
npm run build
```

## Onde depurar

- **UI, rotas e cache:** `src/renderer/src`.
- **API exposta ao renderer:** `src/preload` e `src/contracts`.
- **OAuth, Spotify, letras e janela:** `src/main`.
- **Estado remoto:** React Query DevTools não está instalado; use testes, logs do main e inspeção do cache nos hooks.
- **HTTP 429:** o terminal informa `reason`, `retryAfter`, `retryAt` e a origem da janela.

## Problemas comuns

### Spotify não configurado

Confirme que `.env.local` está dentro de `apps/desktop`, que o Client ID não está vazio e que o processo foi reiniciado.

### Callback inválido ou login não conclui

Compare a URI do Dashboard e a variável caractere por caractere. Verifique também se a porta 8888 está livre durante o login.

### Login funciona, mas chamadas retornam 403

Em Development Mode, confirme a allowlist do aplicativo e os requisitos atuais da conta. Se os scopes mudaram desde o último login, faça logout e autorize novamente.

### Nada tocando ou comando restrito

Inicie uma faixa em um cliente Spotify e confirme que há um dispositivo ativo. Alguns contextos, dispositivos ou a primeira posição de uma lista podem restringir ações como voltar.

### HTTP 429 ou `QUOTA_EXCEEDED`

Pare de reiniciar ou repetir comandos e aguarde o `retryAt` informado. Reiniciar o Nowframe não reduz uma janela controlada pelo Spotify. Se vários desenvolvedores compartilham a mesma conta de desenvolvedor, considere aplicativos próprios.

### Tracklist vazia em uma playlist visível no Spotify

Playlists personalizadas, rádios e recomendações podem não ser expostas como uma playlist legível pela Web API. Playlists privadas de outra conta também podem retornar 403.

### Letra encontrada, mas sem sincronização

LRCLIB pode oferecer apenas texto simples. Lyrics esconde esse conteúdo por padrão e Karaoke informa que não há letra sincronizada. Sincronização por palavra é ainda mais rara e volta automaticamente para linha quando possível.

## Documentos relacionados

- [Referência de configuração](../reference/configuration.md)
- [Visão geral da arquitetura](../architecture/overview.md)
- [Gerar builds desktop](../guides/build-desktop.md)
