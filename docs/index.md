# Documentação do Nowframe

Este índice separa o estado atual do sistema, as decisões que o formaram e os procedimentos de desenvolvimento. As notas de release continuam versionadas separadamente.

## Comece aqui

- [Visão geral da arquitetura](architecture/overview.md): processos Electron, fronteiras e fluxos principais.
- [Desenvolvimento local](development/local-setup.md): Spotify Dashboard, ambiente, execução e diagnóstico.
- [Sincronização e integrações](architecture/playback-and-integrations.md): Spotify, LRCLIB, polling, comandos e limites conhecidos.
- [Sistema de temas](architecture/theme-system.md): contrato comum, variantes e comportamento de fullscreen.

## Desenvolvimento e guias

- [Como adicionar um tema](development/adding-a-theme.md)
- [Gerar builds desktop](guides/build-desktop.md)
- [Referência de configuração](reference/configuration.md)

## Decisões arquiteturais

- [ADR 0001 — Desktop primeiro e extração sob demanda](decisions/0001-desktop-first-and-extract-on-demand.md)
- [ADR 0002 — PKCE e fronteira entre processos](decisions/0002-pkce-and-electron-process-boundary.md)
- [ADR 0003 — Controle remoto com polling adaptativo](decisions/0003-remote-control-with-adaptive-polling.md)
- [ADR 0004 — Contrato comum para temas independentes](decisions/0004-shared-theme-contract.md)

## Releases

As versões publicadas ficam em [`docs/releases/`](releases/), uma nota imutável por versão.
