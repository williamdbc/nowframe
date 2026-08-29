# ADR 0005: Sincronização responsiva sem antecipar metadados

- **Status:** Aceita
- **Data:** 2026-08-29
- **Substitui:** [ADR 0003 — Controle remoto com polling adaptativo](0003-remote-control-with-adaptive-polling.md)

## Contexto

O Nowframe continua sendo um controle remoto visual: mudanças feitas no cliente Spotify só chegam pela Web API e não existe um canal oficial de eventos do player equivalente a WebSocket para esse caso.

A estratégia anterior consultava o playback a cada dois segundos tocando e cinco segundos inativo. Ela protegia a quota, mas deixava perceptível o início da reprodução e outras ações feitas diretamente no Spotify. Uma configuração anterior ainda mais frequente, com polling de um segundo e mais tentativas após comandos, contribuiu para respostas `429` com `QUOTA_EXCEEDED` no Development Mode.

Também se tentou antecipar a próxima capa e os metadados usando o primeiro item da fila em cache. A fila pode ser reorganizada quando o modo aleatório muda sem que a faixa atual também mude. Como a identidade usada pelo cache permanecia igual, o Nowframe podia mostrar uma música incorreta por alguns instantes antes da confirmação do Spotify.

## Decisão

Manter o modelo de controle remoto com polling adaptativo, ajustando a estratégia para equilibrar latência, quota e correção visual:

- consultar playback a cada 1,5 segundos durante reprodução e a cada 2,5 segundos quando pausado, inativo ou sem playback;
- manter o intervalo de 300 ms apenas nos últimos 2,5 segundos previstos da faixa e o refresh programado no limite;
- suspender polling em segundo plano, evitar refetch de foco com cache mais novo que dois segundos e aplicar backoff de 2, 5, 15 e 30 segundos após falhas consecutivas;
- após próxima ou anterior, reconciliar nos offsets 0, 200, 500 e 1.000 ms contados desde o envio do comando, interrompendo assim que o servidor ou o polling confirmar a mudança;
- não antecipar capa, título ou artista com a fila em cache; preservar o conteúdo atual até uma resposta autoritativa confirmar a nova faixa;
- manter atualizações otimistas apenas para intenções determinísticas, como play/pause, seek, volume, aleatório, repetição e biblioteca, sempre com rollback ou expectativa temporária quando aplicável;
- respeitar integralmente `Retry-After` nas consultas periódicas e permitir que a resposta bem-sucedida de um comando não encerre antecipadamente essa janela.

## Alternativas consideradas

### Restaurar polling contínuo de um segundo

Rejeitada porque reduz apenas parte da latência e aumenta continuamente o consumo da quota. Consultas adicionais de letras, biblioteca, álbuns, playlists e comandos ainda precisam caber no mesmo orçamento.

### Manter os intervalos de dois e cinco segundos

Rejeitada porque a economia adicional tornava o primeiro play e mudanças externas claramente perceptíveis. Os intervalos de 1,5 e 2,5 segundos são o compromisso atual e podem ser revistos com métricas reais de uso.

### Continuar antecipando metadados pela fila

Rejeitada porque a previsão melhora o melhor caso, mas mostra informação objetivamente errada quando shuffle, rádio, recomendações ou alterações externas tornam a fila obsoleta. Manter a faixa anterior por alguns milissegundos produz uma transição mais confiável.

### Adotar Web Playback SDK ou serviço de eventos

Continuam fora do escopo atual. O SDK não foi confiável no Electron por causa da reprodução protegida, e um serviço próprio acrescentaria operação e credenciais sem eliminar todas as limitações da plataforma.

## Consequências

- Mudanças externas aparecem mais cedo que na estratégia anterior, sem retornar ao volume permanente do polling de um segundo.
- Próxima e anterior podem preservar a capa anterior por até a confirmação do Spotify, mas não exibem uma faixa prevista incorretamente.
- Comandos determinísticos continuam oferecendo resposta imediata na interface.
- A quota permanece uma restrição externa. Aplicativos criados por contas de desenvolvedor diferentes isolam o consumo entre colaboradores, mas cada conta ainda precisa respeitar seus próprios limites.
- Os números são constantes operacionais do código e devem ser atualizados neste ADR apenas por uma decisão sucessora se a estratégia mudar de forma material.

## Referências

- [Sincronização e integrações](../architecture/playback-and-integrations.md)
- [Intervalos e política da query de playback](../../apps/desktop/src/renderer/src/features/playback/queries/spotify-playback-query-options.ts)
- [Reconciliação dos comandos de transporte](../../apps/desktop/src/renderer/src/features/playback/hooks/useControlSpotifyPlaybackMutation.ts)
- [Janela local de rate limit](../../apps/desktop/src/main/spotify/spotify-rate-limit.ts)
- [Rate limits — Spotify](https://developer.spotify.com/documentation/web-api/concepts/rate-limits)
- [Quota modes — Spotify](https://developer.spotify.com/documentation/web-api/concepts/quota-modes)
