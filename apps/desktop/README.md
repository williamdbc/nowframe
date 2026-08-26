# Music Display Desktop

Aplicação Electron do Music Display, construída com React, Vite, TypeScript, TanStack Router e TanStack Query.

## Desenvolvimento

```bash
npm install
cp .env.example .env.local
npm run dev
```

O `.env.local` recebe somente o Client ID e o redirect URI do Spotify. O Client Secret não pertence ao aplicativo desktop.

## Qualidade

```bash
npm run format:check
npm run typecheck
npm run lint
npm run test
npm run build
```

## Distribuição

```bash
npm run build:mac
npm run build:win
npm run build:linux
```
