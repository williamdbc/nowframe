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
- favorito;
- volume e mudo;
- dispositivo, ao menos de forma acessível;
- carregamento, ausência de playback e erro de comando.

Use as capacidades do playback para desabilitar ações que o dispositivo restringe. Use os estados `is*Pending` para impedir duplicação de comando sem tratar espera transitória como indisponibilidade permanente.

## 3. Aplicar o chrome compartilhado

O elemento raiz deve incluir `player-theme-root`. Os contêineres superiores devem incluir `player-theme-chrome`.

Em fullscreen:

- os slots de conexão, seletor, perfil e entrada em fullscreen chegam vazios;
- renderize `FullscreenExitControl` com `onExitFullScreen`;
- ações próprias do tema, como mostrar letra no Ambient, podem permanecer ao lado da saída.

Isso garante hover/foco uniforme e mantém um caminho visível para sair do modo apresentação.

## 4. Registrar

Atualize os dois pontos em `features/themes/core`:

1. adicione o identificador ao union `PlayerThemeId`;
2. importe o componente e inclua `{ id, name, component }` no `themeRegistry`.

O seletor usa `availableThemes`, portanto não há uma segunda lista para manter.

## 5. Declarar dados especiais

Playback, perfil, biblioteca e janela já são compartilhados. Se o tema usar uma feature condicional existente, atualize `PlaybackDisplayPage`:

- letras: inclua o ID em `shouldLoadLyrics`;
- tracklist: amplie a condição que habilita queries de álbum ou playlist.

Não habilite dados caros para todos os temas por conveniência. Se surgir uma nova fonte, crie a feature proprietária com service IPC, query key e hook antes de expor um contrato normalizado ao tema.

## 6. Testar

Adicione testes específicos para decisões exclusivas da variante: layout semântico, controles próprios, menus, contraste, animações calculadas ou estados condicionais.

O teste `theme-contract.test.tsx` inclui automaticamente toda entrada de `availableThemes` e deve continuar passando. Ele protege conteúdo, comandos, favorito, erros, vazio, chrome e saída de fullscreen.

Execute:

```bash
npm run format:check
npm run typecheck
npm run lint
npm test
npm run build
```

Quando o visual mudar, teste pelo menos a janela mínima de 900×540, 1280×720 e uma tela cheia grande. Verifique título longo, ausência de capa, playback pausado, teclado, hover e `prefers-reduced-motion`.

## Checklist

- [ ] Variante possui apenas código visual próprio.
- [ ] Todas as ações obrigatórias continuam acessíveis.
- [ ] Restrições e estados vazios têm apresentação coerente.
- [ ] Chrome aparece por hover e foco e fullscreen possui saída.
- [ ] Dados extras são carregados somente quando necessários.
- [ ] Registro, union e testes foram atualizados.
- [ ] Não há texto de marca decorativo competindo com a música.

## Documentos relacionados

- [Sistema de temas](../architecture/theme-system.md)
- [ADR 0004](../decisions/0004-shared-theme-contract.md)
