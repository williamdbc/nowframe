# ADR 0004: Contrato comum para temas independentes

- **Status:** Aceita
- **Data:** 2026-08-28

## Contexto

Os temas do Nowframe não são apenas variações de cor. Eles reorganizam capa, texto, transporte, volume, tracklist e letras, e alguns possuem componentes exclusivos. Forçar todos a uma única árvore de componentes limitaria os layouts; duplicar integração com Spotify em cada tema criaria estados divergentes e comportamentos inconsistentes.

## Decisão

Cada tema implementa um layout completo dentro de `features/themes/variants`, mas todos recebem o mesmo `PlayerThemeProps`.

- A página do display possui queries, mutations e decisões de carregamento.
- O contrato entrega estado, capacidades, ações, chrome, letras e tracklist normalizados.
- Cada variante pode ter componentes, assets, hooks, utilitários e CSS próprios.
- Comportamentos estáveis e realmente reutilizados ficam nas features proprietárias, como relógio, progresso, fullscreen e contrato de temas.
- Um registro central define temas disponíveis e um teste de conformidade percorre todos eles.

## Alternativas consideradas

### Um componente universal controlado por tokens e opções

Rejeitado porque layouts como Tracklist, Karaoke e Poster têm estruturas e interações diferentes, não apenas estilos diferentes.

### Cada tema buscar e controlar seus próprios dados

Rejeitado porque duplicaria polling, cache, rollback, autenticação e tratamento de erro, além de aumentar chamadas à Spotify Web API.

### Compartilhar todos os componentes visuais

Rejeitado porque semântica comum não implica desenho comum. A extração ocorre apenas quando o comportamento se prova idêntico em mais de uma variante.

## Consequências

- Novos temas podem mudar profundamente o layout sem alterar serviços Spotify.
- Toda nova capacidade obrigatória exige evolução coordenada do contrato e de todas as variantes.
- O teste de contrato reduz o risco de um tema omitir ações ou estados essenciais.
- Dados especiais devem ser carregados condicionalmente no orquestrador, mantendo temas puros.

## Referências

- [Sistema de temas](../architecture/theme-system.md)
- [Como adicionar um tema](../development/adding-a-theme.md)
