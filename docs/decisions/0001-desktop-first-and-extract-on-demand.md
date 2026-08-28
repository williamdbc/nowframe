# ADR 0001: Desktop primeiro e extração sob demanda

- **Status:** Aceita
- **Data:** 2026-08-28

## Contexto

O objetivo inicial é um projeto pessoal que transforma uma segunda tela em display do Spotify. Uma estrutura antecipando desktop, web, API e vários pacotes compartilhados aumentaria o número de fronteiras antes de existir um segundo consumidor real.

Ao mesmo tempo, a organização precisa permitir evolução futura sem misturar código específico do Electron com possíveis aplicações web ou backend.

## Decisão

Manter o repositório organizado por aplicações, começando apenas com `apps/desktop`.

- `apps/web` e `apps/api` só serão criadas quando houver requisitos próprios.
- Código permanece dentro da aplicação que o possui.
- Uma área compartilhada na raiz só será extraída quando ao menos duas aplicações consumirem o mesmo comportamento ou contrato.
- A documentação transversal permanece em `docs/`; detalhes exclusivos ficam próximos da aplicação quando crescerem o suficiente.

## Alternativas consideradas

### Criar `apps/desktop`, `apps/web`, `apps/api` e `packages/*` desde o início

Rejeitada porque materializaria aplicações vazias e abstrações preventivas. Também obrigaria decisões prematuras de build, versionamento e compatibilidade entre pacotes.

### Manter tudo na raiz sem a pasta `apps`

Rejeitada porque o processo Electron já é uma unidade implantável clara e uma futura aplicação web teria ciclo de vida próprio.

## Consequências

- A árvore atual é pequena e reflete apenas software executável.
- Features e contratos podem ser refatorados quando a segunda utilização provar a fronteira correta.
- Uma futura aplicação web não deve importar código diretamente de `apps/desktop`; a extração acontecerá em um commit próprio.
- O custo futuro de mover código é aceito em troca de evitar uma arquitetura especulativa agora.

## Referências

- [Visão geral da arquitetura](../architecture/overview.md)
- [README do repositório](../../README.md)
