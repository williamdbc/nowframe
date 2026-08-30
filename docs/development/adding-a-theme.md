# Como adicionar um tema

## Objetivo

Adicionar um layout novo sem duplicar autenticação, queries ou comandos de playback. Um tema recebe o contrato comum e possui apenas apresentação e interação visual.

## 1. Criar a variante

Use um identificador curto em kebab-case e crie:

```text
src/renderer/src/features/themes/variants/<tema>/
├── <tema>-player-theme.tsx
├── <tema>-player-theme.css
├── components/   quando houver componentes próprios
├── assets/       quando houver ícones ou imagens próprios
├── hooks/        quando houver estado visual próprio
└── utils/        quando houver cálculo testável próprio
```

Não crie subpastas vazias. Mantenha arquivos no nível da variante enquanto houver poucos itens.

O componente principal deve receber `PlayerThemeProps`. Ele não deve importar services, hooks de query, `window.nowframe` nem contratos externos do Spotify.

## 2. Cobrir o contrato

O layout precisa representar, quando disponíveis:

- faixa ou episódio, criadores, coleção e capa;
- progresso e seek;
- anterior, play/pause e próxima;
- aleatório e repetição;
- favorito, salvo uma exceção visual explicitamente documentada;
- volume e mudo;
- dispositivo, ao menos de forma acessível;
- carregamento, ausência de playback e erro de comando.

Use as capacidades do playback para desabilitar ações que o dispositivo restringe. Use os estados `is*Pending` para impedir duplicação de comando sem tratar espera transitória como indisponibilidade permanente.

Novos temas devem expor todas as ações acima. A única exceção atual é o CD Cover, que omite o favorito para preservar a simetria do desenho. Qualquer nova exceção precisa de uma justificativa visual e deve ser nomeada no teste de contrato, em vez de ficar silenciosamente ausente.

## 3. Aplicar o chrome compartilhado

O elemento raiz deve incluir `player-theme-root`. Os contêineres superiores devem incluir `player-theme-chrome`.

Em fullscreen:

- conexão e entrada em fullscreen chegam vazias;
- seletor de tema e perfil continuam disponíveis por hover ou foco;
- renderize `FullscreenExitControl` com `onExitFullScreen`;
- ações próprias do tema, como mostrar letra no Ambient, podem permanecer ao lado da saída.

Isso garante hover/foco uniforme e mantém um caminho visível para sair do modo apresentação.

## 4. Registrar

Atualize os dois pontos em `features/themes/core`:

1. adicione o identificador ao union `PlayerThemeId`;
2. importe o componente e inclua `{ id, name, category, component }` no `themeRegistry`.

Use `category: 'main'` para layouts de uso geral e visual mais neutro. Use `category: 'conceptual'` para experiências que assumem claramente a identidade de um objeto, jogo ou universo visual. O seletor apresenta essas categorias como `Principais` e `Conceituais`; a categoria organiza a descoberta e não muda o contrato recebido pelo tema.

O seletor usa `availableThemes`, portanto não há uma segunda lista para manter.

## 5. Declarar dados especiais

Playback, perfil, biblioteca e janela já são compartilhados. Se o tema usar uma feature condicional existente, atualize `PlaybackDisplayPage`:

- letras: inclua o ID em `shouldLoadLyrics`;
- tracklist: declare `usesTracklist: true` na entrada do `themeRegistry`.

Não habilite dados caros para todos os temas por conveniência. Se surgir uma nova fonte, crie a feature proprietária com service IPC, query key e hook antes de expor um contrato normalizado ao tema.

## 6. Testar

Adicione testes específicos para decisões exclusivas da variante: layout semântico, controles próprios, menus, contraste, animações calculadas ou estados condicionais.

O teste `theme-contract.test.tsx` inclui automaticamente toda entrada de `availableThemes` e deve continuar passando. Ele protege conteúdo, comandos, favorito, erros, vazio, chrome e saída de fullscreen. Exceções deliberadas, como a ausência de favorito no CD Cover, ficam nomeadas no próprio teste com a justificativa correspondente.

Execute:

```bash
npm run format:check
npm run typecheck
npm run lint
npm test
npm run build
```

Quando o visual mudar, teste pelo menos a janela mínima de 900×540, 1280×720 e uma tela cheia grande. Verifique título longo, ausência de capa, playback pausado, teclado, hover e `prefers-reduced-motion`.

Títulos com `overflow: hidden`, line clamp ou palavras animadas em elementos inline precisam de uma verificação tipográfica adicional. Use texto com descendentes (`g`, `y`, `p`, `q` e `j`) e confirme que a altura real do conteúdo cabe no contêiner, sem revelar uma linha além do limite. Folga interna pode ser compensada por margem negativa quando o desenho não deve se deslocar.

## Checklist

- [ ] Variante possui apenas código visual próprio.
- [ ] Todas as ações obrigatórias continuam acessíveis.
- [ ] Restrições e estados vazios têm apresentação coerente.
- [ ] Chrome aparece por hover e foco e fullscreen possui saída.
- [ ] Dados extras são carregados somente quando necessários.
- [ ] Registro, categoria, union e testes foram atualizados.
- [ ] Títulos longos e letras descendentes não são recortados.
- [ ] Não há texto de marca decorativo competindo com a música.

## Documentos relacionados

- [Sistema de temas](../architecture/theme-system.md)
- [ADR 0004](../decisions/0004-shared-theme-contract.md)
