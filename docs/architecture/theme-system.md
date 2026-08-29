# Sistema de temas

## Princípio

Cada tema é um layout completo e pode possuir componentes, assets, hooks, utilitários e CSS próprios. A integração com Spotify, LRCLIB, fullscreen e cache permanece fora das variantes.

O compartilhamento acontece no contrato de domínio: todos os temas recebem os mesmos dados e ações, mas decidem como apresentá-los. Isso evita tanto um componente universal difícil de estilizar quanto a duplicação de regras de playback em cada visual.

## Organização

```text
features/themes/
├── core/
│   ├── components/
│   ├── hooks/
│   ├── types/
│   ├── utils/
│   └── theme-registry.ts
└── variants/
    ├── ambient/
    ├── arcade-select/
    ├── cassette/
    ├── cd-cover/
    ├── default/
    ├── drive/
    ├── karaoke/
    ├── lyrics/
    ├── minimalist/
    ├── poster/
    ├── rocket-league/
    ├── setlist/
    ├── spotlight/
    ├── tracklist/
    └── vinyl/
```

`core` define o contrato e o seletor. `variants` contém tudo que pertence ao desenho de um tema. Componentes de playback realmente compartilhados, como o range de progresso, continuam na feature `playback` e aceitam classes e cores específicas.

A derivação de cor a partir da capa é a exceção útil: a amostragem dos pixels vive em `core`, porque quatro temas leem os mesmos pixels, e cada cálculo continua ao lado do tema que o inventou. O CD Cover reusa a média do Poster e o Vinyl reusa o agrupamento por matiz do Ambient, em vez de reescrever. O que varia é o cálculo, não a amostragem.

Conceitos que repetem exatamente a mesma interação podem possuir uma infraestrutura visual em `core`. `ConceptPlaybackHud` e `ConceptThemeChrome` preservam o contrato de controles e chrome sem impor a identidade visual. O trilho arrastável pertence ao Arcade Select enquanto não houver uma segunda variante que reutilize seu comportamento.

## Contrato do tema

`PlayerThemeProps` entrega:

- estado de playback, status de carregamento e capacidades publicadas pelo dispositivo;
- comandos de transporte, seek, volume, mudo, aleatório, repetição e favorito;
- estados de execução e uma mensagem de erro agregada;
- slots de conexão, seletor, perfil e fullscreen;
- estado e ação de saída do fullscreen;
- letras normalizadas;
- tracklist normalizada e ação para reproduzir uma posição do contexto.

Temas não chamam `window.nowframe`, services nem TanStack Query. A página `PlaybackDisplayPage` orquestra dados e mutations e entrega props puras ao componente ativo.

## Temas atuais

| Tema          | Característica principal                                        | Dados condicionais |
| ------------- | --------------------------------------------------------------- | ------------------ |
| Ambient       | Cor extraída da capa, modo imersivo e letra opcional            | Letras             |
| Arcade Select | Seletor de jogo de ritmo com cartões em perspectiva             | Álbum ou playlist  |
| Cassette      | Fita física com carretéis e distribuição animada pelo progresso | Nenhum             |
| CD Cover      | Capa clara com o disco girando atrás dela, tingido pela arte    | Nenhum             |
| Default       | Capa e informações em duas colunas                              | Nenhum             |
| Drive         | Controles amplos para leitura à distância                       | Nenhum             |
| Karaoke       | Trilho de frases e preenchimento por palavra quando disponível  | Letras             |
| Lyrics        | Letra sincronizada em destaque                                  | Letras             |
| Minimalist    | Informação e transporte com baixa densidade visual              | Nenhum             |
| Poster        | Capa em tela inteira, degradê derivado e contraste automático   | Nenhum             |
| Rocket League | Arena azul e laranja, placar central, bola de progresso e boost | Nenhum             |
| Setlist       | Papel de palco com faixas anteriores riscadas e atual iluminada | Álbum ou playlist  |
| Spotlight     | Capa central sobre arte desfocada                               | Nenhum             |
| Tracklist     | Carrossel arrastável de faixas do álbum ou playlist             | Álbum ou playlist  |
| Vinyl         | Vinil do tamanho da tela girando com a música, na matiz da capa | Nenhum             |

Dados condicionais são carregados apenas para os temas que os usam. A capacidade `usesTracklist` é declarada no registro e habilita a consulta de álbum ou playlist sem acoplar a página a IDs específicos. Trocar de tema não duplica playback, perfil, biblioteca ou estado da janela.

## Chrome e fullscreen

Na janela normal:

- conexão fica no canto superior esquerdo;
- seletor, perfil e fullscreen ficam no canto superior direito;
- os controles superiores iniciam transparentes e aparecem por hover ou foco;
- foco por teclado mantém as ações visíveis.

Em fullscreen, a página entrega slots vazios. Cada tema mostra o controle compartilhado para sair; Ambient também pode mostrar sua ação de letra. `Escape` encerra o modo em qualquer tema e uma dica temporária aparece ao entrar.

As classes `player-theme-root` e `player-theme-chrome` formam o comportamento compartilhado. Variantes podem adicionar suas próprias classes visuais sem recriar a regra de visibilidade.

## Preferência e registro

O registro central é a fonte da lista exibida no seletor. O identificador ativo fica em `localStorage` sob `nowframe:selected-theme`; valores desconhecidos voltam para `default`.

Adicionar uma variante exige atualizar o union `PlayerThemeId` e o `themeRegistry`. O teste de contrato percorre `availableThemes`, renderiza cada componente e verifica conteúdo, transporte, favorito, erros, estados vazios, chrome e saída do fullscreen. O seletor arrastável do Arcade Select possui testes próprios para clique, limiar de arraste, supressão de clique acidental e inércia.

## Documentos relacionados

- [Como adicionar um tema](../development/adding-a-theme.md)
- [Contrato comum para temas independentes](../decisions/0004-shared-theme-contract.md)
- [Sincronização e integrações](playback-and-integrations.md)
