# Nowframe Desktop

Aplicação Electron do Nowframe, construída com React, Vite, TypeScript, TanStack Router e TanStack Query.

## Início rápido

```bash
npm install
cp .env.example .env.local
npm run dev
```

O `.env.local` recebe somente o Client ID e o redirect URI do Spotify. O Client Secret não pertence ao aplicativo desktop. Cadastre exatamente `http://127.0.0.1:8888/callback` nas Redirect URIs do aplicativo no Spotify Dashboard.

Consulte:

- [Desenvolvimento local](../../docs/development/local-setup.md)
- [Visão geral da arquitetura](../../docs/architecture/overview.md)
- [Referência de configuração](../../docs/reference/configuration.md)
- [Guia de build](../../docs/guides/build-desktop.md)

## Qualidade

```bash
npm run format:check
npm run typecheck
npm run lint
npm run test
npm run build
```
