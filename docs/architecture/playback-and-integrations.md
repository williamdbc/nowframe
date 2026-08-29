# Sincronização e integrações

## Modelo de reprodução

O Nowframe é um display e controle remoto. Ele não é um dispositivo Spotify Connect e não reproduz áudio: os comandos são enviados ao dispositivo já ativo no Spotify. Sem uma sessão ou dispositivo capaz de reproduzir, a Web API pode retornar ausência de playback ou restrições de comando.

Essa fronteira evita depender do Web Playback SDK dentro do Electron e mantém uma única fonte de verdade para áudio, fila e dispositivo.

## Sincronização periódica

O estado base vem de `GET /me/player` e é reduzido no processo main para conteúdo, progresso, contexto, dispositivo, capacidades, volume, aleatório e repetição.

| Situação                         |             Intervalo |
| -------------------------------- | --------------------: |
| Reprodução ativa                 |          1,5 segundos |
| Pausado, inativo ou sem playback |          2,5 segundos |
| Últimos 2,5 segundos da faixa    |                300 ms |
| Falhas consecutivas              | 2 s, 5 s, 15 s e 30 s |

Além do intervalo adaptativo:

- um refresh é programado para o fim previsto da faixa, com uma pequena margem;
- o polling para quando a janela fica em segundo plano;
- ao recuperar foco, só há nova consulta se o cache tiver pelo menos dois segundos;
- o campo `timestamp` do Spotify serve como sinal de mudança, nunca como base para calcular progresso.

Mudanças feitas diretamente no Spotify são percebidas na próxima consulta. Em reprodução normal isso significa até aproximadamente 1,5 segundo; enquanto o player está inativo, até 2,5 segundos. Esses intervalos equilibram resposta visual e consumo da quota de Development Mode.

## Relógio local

Entre respostas, a posição avança com `performance.now()`, que é monotônico e não sofre saltos do relógio do sistema. O processo main ancora cada resposta aproximadamente no meio da viagem HTTP para compensar metade do tempo de ida e volta.

O relógio compartilhado:

- usa `requestAnimationFrame` somente enquanto há reprodução e ouvintes;
- aplica imediatamente trocas de faixa, play/pause e diferenças de pelo menos 1,5 segundo;
- absorve diferenças menores por convergência de 20%, evitando a barra andar para trás;
- permite cadências diferentes: desenho da barra por frame e letras a cada 50 ms.

## Comandos e estado otimista

- **Play/pause:** atualiza imediatamente o estado e a âncora do progresso; falha restaura o cache anterior.
- **Anterior/próxima:** mantém capa, título e artista atuais até o Spotify confirmar a troca e reconcilia o servidor em até quatro consultas nos offsets 0, 200, 500 e 1.000 ms, medidos desde o envio do comando.
- **Seek:** move o cache imediatamente e envia a posição final ao encerrar a interação.
- **Volume:** reflete o valor local durante o arraste, limita envios a um a cada 200 ms e confirma o último valor ao soltar.
- **Mudo:** envia volume zero e mantém em memória o último volume audível para restauração.
- **Aleatório e repetição:** usam o estado já presente no playback e atualizações otimistas. Repetição percorre `off`, `context` e `track`.
- **Favorito:** consulta a biblioteca uma vez por URI, mantém o resultado em cache e faz rollback se salvar ou remover falhar.

Respostas antigas que contradizem uma expectativa otimista são descartadas até o Spotify publicar o novo estado, evitando piscadas e rollbacks temporários.

A fila retornada pelo Spotify não é usada para antecipar os metadados de próxima faixa. Ativar ou desativar o modo aleatório pode reorganizar a fila sem alterar a faixa atual, deixando qualquer cache indexado apenas pelo conteúdo atual temporariamente obsoleto. Nesse cenário, preservar a faixa exibida por alguns milissegundos é preferível a mostrar uma capa incorreta e corrigi-la depois.

### Dívida técnica conhecida

[`PlaybackDisplayPage`](../../apps/desktop/src/renderer/src/features/playback/components/playback-display-page.tsx) ainda aquece uma query de fila a cada identidade de conteúdo por meio de `useGetSpotifyPlaybackQueueQuery`. Esse cache deixou de participar dos comandos e não é consumido pelos temas atuais; portanto, não é uma dependência arquitetural. Remover essa chamada em uma mudança de código posterior reduzirá uma requisição ao Spotify por troca de faixa.

## Limites e quota do Spotify

Um HTTP 429 pode representar rate limit ou quota do modo de desenvolvimento. O processo main registra motivo, duração, origem e instante de liberação. Quando existe `Retry-After`, a janela nunca é encurtada por outro comando bem-sucedido; consultas periódicas são bloqueadas localmente até vencer.

Comandos iniciados pela pessoa continuam podendo atravessar o gate de polling. Eles são raros comparados à sincronização e preservam a capacidade de controle em limites curtos, mas ainda podem receber 429 do Spotify.

No Development Mode, usuários precisam estar na allowlist e as requisições de aplicativos pertencentes à mesma conta de desenvolvedor compartilham quota. Para desenvolvimento simultâneo, cada colaborador pode usar seu próprio aplicativo Spotify e Client ID; nenhum deles deve copiar Client Secret para o Nowframe.

Referências oficiais:

- [Rate limits](https://developer.spotify.com/documentation/web-api/concepts/rate-limits)
- [Quota modes](https://developer.spotify.com/documentation/web-api/concepts/quota-modes)
- [Get Playback State](https://developer.spotify.com/documentation/web-api/reference/get-information-about-the-users-current-playback)

## Tracklist

O tema Tracklist carrega dados adicionais somente quando está ativo:

- contexto de álbum: pagina `GET /albums/{id}/tracks` em blocos de 50;
- contexto de playlist: carrega metadados e pagina `GET /playlists/{id}/items` em blocos de 50;
- contexto ausente: usa o álbum da faixa atual como fallback quando disponível.

Cada faixa recebe uma posição no contexto. Clicar nela envia `context_uri` e `offset.position`, mantendo a sequência original. Itens inválidos, episódios e faixas indisponíveis são ignorados ou desabilitados.

O Spotify pode impedir a leitura de playlists que não pertençam à conta nem sejam colaborativas. Contextos personalizados, rádios e recomendações visíveis no cliente oficial também podem não expor uma playlist equivalente pela Web API; nesse caso o tema informa que a lista não está disponível.

## Letras

Letras são consultadas no LRCLIB somente para faixas e somente quando Ambient, Lyrics ou Karaoke está ativo. A busca usa título, primeiro artista, álbum e duração; resultados ficam em cache por 30 minutos e a chamada expira após oito segundos.

Estados possíveis:

- carregando, erro, não encontrada ou instrumental;
- letra simples, sem tempos;
- sincronização por linha via LRC;
- sincronização por palavra via `lyricsfile` 1.0 quando a fonte oferece esses dados.

O tema Lyrics esconde letra não sincronizada por padrão (`showUnsynchronizedLyrics = false`). Karaoke exige ao menos sincronização por linha, antecipa a frase em 500 ms e preenche palavras individualmente quando os tempos por palavra existem. A indisponibilidade de sincronização por palavra não impede o fallback por linha.

LRCLIB é uma integração externa independente do Spotify; disponibilidade e correspondência da letra não são garantidas.

## Documentos relacionados

- [Visão geral da arquitetura](overview.md)
- [Sincronização responsiva sem antecipar metadados](../decisions/0005-responsive-sync-without-metadata-prediction.md)
- [Referência de configuração](../reference/configuration.md)
