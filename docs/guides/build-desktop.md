# Gerar builds desktop

## Pré-requisitos

Instale dependências e configure `apps/desktop/.env.local` conforme [desenvolvimento local](../development/local-setup.md). O Client ID é incorporado ao processo main no build; o Client Secret nunca deve ser incluído.

Antes de empacotar:

```bash
cd apps/desktop
npm run format:check
npm run typecheck
npm run lint
npm test
npm run build
```

## Inspeção local sem instalador

```bash
npm run build:unpack
```

O Electron Builder grava em `apps/desktop/dist/`. No macOS ARM, por exemplo, a aplicação descompactada fica em:

```text
dist/mac-arm64/Nowframe.app
```

O `.app` é o bundle nativo do macOS. Em `npm run dev`, a aplicação usa o processo de desenvolvimento do Electron e não o bundle empacotado, por isso nome, ícone e comportamento do Finder podem diferir.

## Artefatos por plataforma

| Comando               | Configuração atual                              |
| --------------------- | ----------------------------------------------- |
| `npm run build:mac`   | Aplicação macOS e DMG `nowframe-<version>.dmg`. |
| `npm run build:win`   | Instalador NSIS `nowframe-<version>-setup.exe`. |
| `npm run build:linux` | AppImage, Snap e DEB.                           |

Prefira gerar e testar cada artefato no sistema operacional de destino. O Electron Builder oferece alguma compilação cruzada, mas instaladores, assinatura e validação nativa continuam dependentes da plataforma e das ferramentas disponíveis.

O número usado no nome e nos metadados do artefato vem de `apps/desktop/package.json`, atualmente `0.1.0`. As tags e releases do GitHub não atualizam esse campo automaticamente. Antes de distribuir um binário como versão pública, alinhe conscientemente as duas versões e gere o pacote novamente.

## Ícones

Os recursos ficam em `apps/desktop/build/`:

- `icon-source.png`: fonte visual;
- `icon.icns`: macOS;
- `icon.ico`: Windows;
- `icon.png`: Linux e usos do builder;
- `resources/icon.png`: ícone usado pela janela Linux em runtime.

Ao trocar o ícone, regenere os formatos derivados e valide em tamanho pequeno, no Finder/Dock, no instalador do Windows e no launcher Linux.

## Assinatura e distribuição

O projeto ainda é pessoal e a configuração atual não representa uma cadeia pública de distribuição:

- notarização macOS está desativada;
- assinatura Windows não está configurada;
- o provider de update aponta para `https://example.invalid/nowframe/updates` e é apenas placeholder;
- não existe publicação automática de binários no GitHub Release.

Consequentemente, builds compartilhados podem exibir avisos do Gatekeeper, SmartScreen ou do ambiente Linux. Antes de uma distribuição pública, configure identidade de assinatura, notarização, certificados, canal de update e automação de artefatos como uma iniciativa separada.

## Validar o pacote

1. Abra a aplicação empacotada, não apenas `npm run dev`.
2. Confirme nome e ícone.
3. Faça login pelo callback loopback.
4. Teste playback, fullscreen, troca de tema, letras e Tracklist.
5. Feche e abra novamente para validar sessão cifrada e tema persistido.
6. Teste logout e remoção da sessão.

## Documentos relacionados

- [Referência de configuração](../reference/configuration.md)
- [Visão geral da arquitetura](../architecture/overview.md)
