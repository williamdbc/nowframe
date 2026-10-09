# Demonstração dos temas

Na pasta `apps/desktop`, execute `npm run demo:themes` (encerre o dev normal antes).

1. Conecte o Spotify e deixe uma música tocando.
2. Maximize a janela, mas não ative o modo imersivo do player: ele esconde o seletor.
3. Posicione o mouse dentro da janela, inicie a gravação e pressione **F8** (em alguns Macs, **Fn + F8**). No macOS, o mouse real se move a partir de sua posição atual.
4. Ao apertar F8, o mouse começa a se mover para o seletor e escolhe o próximo tema na ordem visual do menu. Depois de cada clique, ele permanece no ponto onde clicou e o tema fica visível por 1 segundo antes da próxima troca. O tema que já estava aberto não é selecionado novamente no início.
5. **Esc** interrompe. F8 repete. Ao concluir normalmente, o tema inicial é restaurado.

Não há avisos ou instruções sobrepostos à interface. Falhas são registradas apenas no console.

O script usa os temas disponíveis no registro: Prism, Cassette e Rocket League continuam excluídos. Os botões são localizados no DOM e suas posições calculadas a cada movimento, sem coordenadas fixas para uma resolução específica. Menus longos são rolados automaticamente.

Os tempos ficam em `showcaseTiming`, no arquivo `showcase-themes.ts`. No macOS, configure o gravador para capturar o cursor do sistema. Não mova/redimensione a janela nem interaja com o app enquanto a sequência estiver rodando. Perder o foco da janela ou apertar Esc interrompe a automação.

## Mouse real no macOS

O comando compila `native-cursor.swift` com as Command Line Tools do Xcode e salva o executável em `node_modules/.cache/nowframe-demo/` (ignorado pelo Git). Não precisa instalar Python. O auxiliar usa eventos nativos do macOS para mover o mouse e clicar; cada movimento começa na posição real atual do ponteiro.

Na primeira execução, o macOS pode pedir permissão de **Acessibilidade**. Em Ajustes do Sistema > Privacidade e Segurança > Acessibilidade, autorize o aplicativo indicado pelo sistema (Electron/Nowframe ou native-cursor), volte ao Nowframe e tente F8 novamente. Se necessário, reinicie a demonstração após autorizar.

O IPC do controlador é registrado apenas em desenvolvimento, com a flag do launcher. Aceita somente alvos dentro da janela remetente em foco; o auxiliar também verifica o aplicativo em primeiro plano durante o movimento. Builds de produção não habilitam esse controle.

Em Windows/Linux, por enquanto o comando mantém o cursor SVG simulado. O modo de controle nativo implementado aqui é específico do macOS.

Essa ferramenta não grava o vídeo nem altera a reprodução. Usa a música e os dados reais do aplicativo, então letras e tracklists dependem da disponibilidade e do carregamento das respectivas APIs.

No `npm run dev` normal e nos builds de produção, a demonstração não é ativada.
