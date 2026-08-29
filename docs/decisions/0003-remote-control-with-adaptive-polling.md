# ADR 0003: Controle remoto com polling adaptativo

- **Status:** Substituída pela [ADR 0005](0005-responsive-sync-without-metadata-prediction.md)
- **Data:** 2026-08-28

## Contexto

O display precisa acompanhar play, pause, posição e trocas feitas tanto no Nowframe quanto no cliente Spotify. A Spotify Web API oferece leitura e comandos HTTP, mas não fornece ao aplicativo um canal oficial em tempo real equivalente a WebSocket para mudanças do player.

Uma tentativa de usar o Web Playback SDK dentro do Electron encontrou incompatibilidade de áudio protegido e falhas de licença. Mesmo quando o dispositivo chegou a ser registrado, a reprodução não foi confiável o suficiente para ser a base do desktop.

Polling muito rápido reduz atraso, mas pressiona rate limits e a quota restrita do Development Mode. Polling lento torna mudanças externas perceptíveis.

## Decisão

Manter o Spotify como responsável pelo áudio e usar o Nowframe como controle remoto com sincronização adaptativa.

- Consultar playback a cada dois segundos tocando e cinco segundos inativo.
- Adensar apenas perto do fim previsto da faixa e programar uma consulta nesse limite.
- Pausar em segundo plano e evitar refetch de foco quando o cache ainda é recente.
- Projetar o progresso com um relógio monotônico local entre respostas.
- Usar atualização otimista, fila em cache e uma reconciliação curta após comandos.
- Respeitar integralmente `Retry-After` para novas consultas periódicas e registrar o motivo de HTTP 429.

## Alternativas consideradas

### Web Playback SDK como player do Electron

Rejeitada para a aplicação atual porque a pilha DRM/Widevine do Electron não produziu reprodução confiável. Pode ser reavaliada em um ambiente web suportado.

### Polling fixo muito frequente

Rejeitado porque chamadas contínuas de um segundo e rajadas de reconciliação aumentaram significativamente o risco de `QUOTA_EXCEEDED`.

### Serviço self-hosted para eventos do player

Adiado. Acrescentaria operação de servidor, credenciais e uma solução geralmente vinculada a uma conta, incompatível com o escopo pessoal simples atual.

## Consequências

- Comandos do Nowframe parecem imediatos graças ao estado otimista.
- Mudanças feitas diretamente no Spotify podem levar até o próximo polling para aparecer.
- O progresso e as letras continuam fluidos sem exigir uma chamada por atualização visual.
- O aplicativo depende de um dispositivo Spotify ativo e não toca áudio sozinho.
- Quota continua sendo uma restrição externa; colaboradores devem coordenar ou usar aplicativos Spotify próprios durante o desenvolvimento.

## Referências

- [Sincronização e integrações](../architecture/playback-and-integrations.md)
- [ADR 0005 — Sincronização responsiva sem antecipar metadados](0005-responsive-sync-without-metadata-prediction.md)
- [Rate limits — Spotify](https://developer.spotify.com/documentation/web-api/concepts/rate-limits)
- [Quota modes — Spotify](https://developer.spotify.com/documentation/web-api/concepts/quota-modes)
