# Demonstração dos temas

Na pasta `apps/desktop`, execute `npm run demo:themes` (encerre o dev normal antes).

1. Conecte o Spotify e deixe uma música tocando.
2. Maximize a janela, mas não ative o modo imersivo do player: ele esconde o seletor.
3. Posicione o mouse dentro da janela, inicie a gravação e pressione **F8** (em alguns Macs, **Fn + F8**). O cursor simulado começa na última posição registrada do mouse, sem saltar para um canto.
4. Ao apertar F8, o cursor simulado começa imediatamente a se mover para o seletor e escolhe o próximo tema na ordem visual do menu. Depois de cada clique, ele permanece no ponto onde clicou e o tema fica visível por 1 segundo antes da próxima troca. O tema que já estava aberto não é selecionado novamente no início.
5. **Esc** interrompe. F8 repete. Ao concluir normalmente, o tema inicial é restaurado.

Não há avisos ou instruções sobrepostos à interface. Falhas são registradas apenas no console.

O script usa os temas disponíveis no registro: Prism, Cassette e Rocket League continuam excluídos. Os botões são localizados no DOM e suas posições calculadas a cada movimento, sem coordenadas fixas para uma resolução específica. Menus longos são rolados automaticamente.

Os tempos ficam em `showcaseTiming`, no arquivo `showcase-themes.ts`. A gravação precisa capturar o conteúdo da janela; não depende da captura do cursor do sistema. O mouse real fica oculto durante a sequência. Não mova/redimensione a janela nem interaja com o app enquanto a sequência estiver rodando.

Essa ferramenta não grava o vídeo nem altera a reprodução. Usa a música e os dados reais do aplicativo, então letras e tracklists dependem da disponibilidade e do carregamento das respectivas APIs.

No `npm run dev` normal e nos builds de produção, a demonstração não é ativada.
