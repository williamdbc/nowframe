# Music Display

Aplicativo desktop que transforma uma segunda tela em uma interface landscape para acompanhar a reprodução do Spotify.

## Estrutura

```text
apps/
  desktop/  Electron, React, Vite e TypeScript
docs/       Decisões e documentação do projeto
```

As aplicações futuras (`web` e `api`) serão adicionadas somente quando houver uma necessidade concreta. Código compartilhado permanece dentro da aplicação proprietária até existir uma segunda utilização real.

## Desktop

```bash
npm --prefix apps/desktop install
npm --prefix apps/desktop run dev
```

Validações:

```bash
npm --prefix apps/desktop run format:check
npm --prefix apps/desktop run typecheck
npm --prefix apps/desktop run lint
npm --prefix apps/desktop run test
npm --prefix apps/desktop run build
```

Copie `apps/desktop/.env.example` para `apps/desktop/.env.local` e informe somente o Client ID do Spotify. O aplicativo desktop usa Authorization Code com PKCE e não deve receber o Client Secret.
