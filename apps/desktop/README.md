# Nowframe Desktop

Aplicação Electron do Nowframe, construída com React, Vite, TypeScript, TanStack Router e TanStack Query.

## Início rápido

Antes de executar, siga o [passo a passo de configuração do Spotify no README principal](../../README.md#configurar-o-spotify): crie seu próprio app, marque Web API e copie o Client ID. Web Playback SDK e Client Secret não são necessários.

Execute os comandos abaixo dentro de `apps/desktop`:

```bash
npm install
cp .env.example .env.local
```

No PowerShell, use `Copy-Item .env.example .env.local` no lugar de `cp`.

Preencha `.env.local` antes de iniciar:

```dotenv
MAIN_VITE_SPOTIFY_CLIENT_ID=seu_client_id
MAIN_VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:8888/callback
```

A Redirect URI deve ser a mesma cadastrada no Dashboard. Depois, execute:

```bash
npm run dev
```

Conecte a conta no Nowframe e inicie uma música no Spotify para testar.

## Builds

Com o `.env.local` configurado, execute dentro de `apps/desktop`:

```bash
npm run build:unpack
```

Para gerar os pacotes de cada plataforma, use `npm run build:mac`, `npm run build:win` ou `npm run build:linux`, preferencialmente no sistema de destino. Os artefatos ficam em `dist/`.

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
