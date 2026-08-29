# Nowframe

Sua música, em outra tela. O Nowframe transforma um display secundário em uma experiência visual personalizável para acompanhar e controlar a reprodução do Spotify.

O aplicativo é um controle remoto visual: o áudio continua no dispositivo ativo do Spotify, enquanto o Nowframe mostra capa, progresso, letras e listas de faixas e oferece controles de reprodução.

## Estado atual

- Aplicação desktop para macOS, Windows e Linux com Electron, React, Vite e TypeScript.
- Login Spotify com Authorization Code + PKCE, sem Client Secret no aplicativo.
- Controles de reprodução, volume, aleatório, repetição e biblioteca.
- Quinze temas: Ambient, Arcade Select, Cassette, CD Cover, Default, Drive, Karaoke, Lyrics, Minimalist, Poster, Rocket League, Setlist, Spotlight, Tracklist e Vinyl.
- Letras sincronizadas via LRCLIB quando disponíveis.

## Estrutura do repositório

```text
apps/
  desktop/  Electron, React, Vite e TypeScript
docs/       Arquitetura, decisões, desenvolvimento, guias e releases
```

As aplicações futuras (`web` e `api`) serão adicionadas somente quando houver uma necessidade concreta. Código compartilhado permanece dentro da aplicação proprietária até existir uma segunda utilização real.

## Início rápido

Crie um aplicativo no Spotify Developer Dashboard, cadastre `http://127.0.0.1:8888/callback` e copie somente o Client ID para o ambiente local. O Client Secret não pertence ao aplicativo desktop.

```bash
npm --prefix apps/desktop install
cp apps/desktop/.env.example apps/desktop/.env.local
npm --prefix apps/desktop run dev
```

Preencha `MAIN_VITE_SPOTIFY_CLIENT_ID` em `apps/desktop/.env.local` antes de iniciar. Consulte [desenvolvimento local](docs/development/local-setup.md) para configurar o Spotify Dashboard e resolver problemas comuns.

## Documentação

- [Índice da documentação](docs/index.md)
- [Visão geral da arquitetura](docs/architecture/overview.md)
- [Sincronização e integrações](docs/architecture/playback-and-integrations.md)
- [Sistema de temas](docs/architecture/theme-system.md)
- [Como adicionar um tema](docs/development/adding-a-theme.md)
- [Gerar builds desktop](docs/guides/build-desktop.md)
- [Release notes](docs/releases/)

## Qualidade

```bash
npm --prefix apps/desktop run format:check
npm --prefix apps/desktop run typecheck
npm --prefix apps/desktop run lint
npm --prefix apps/desktop run test
npm --prefix apps/desktop run build
```
