import { useEffect } from 'react'
import type { RefObject } from 'react'

import { playbackClock } from '@/features/playback/utils/playback-clock'

/**
 * Quantos segundos de música cabem numa volta do disco.
 *
 * Um LP gira a 33⅓ rpm, ou 1,8 s por volta. Aqui o disco tem o tamanho da tela, e nessa
 * escala a velocidade real fica enjoativa num display que fica ligado a tarde toda: a
 * borda do rótulo passaria de 700 px/s. O CD Cover resolve o mesmo problema com 16 s por
 * volta num disco quatro vezes menor; 20 s mantém a leitura de "está girando" com uma
 * velocidade linear parecida com a daquele tema.
 */
const secondsPerTurn = 20

/**
 * O ângulo vem da posição de reprodução, não de uma animação CSS de duração fixa. Isso
 * resolve três casos que a animação erraria: pausar congela o disco no ângulo certo, um
 * seek reposiciona em vez de continuar de onde parou, e trocar de faixa recomeça do zero.
 *
 * A escrita é direta no DOM, sem passar pelo React: são 60 atualizações por segundo, e
 * re-renderizar a árvore do tema nessa cadência era exatamente o que a barra de progresso
 * deixou de fazer.
 *
 * Diferente do CD Cover, o giro respeita `prefers-reduced-motion`. Lá o disco é um detalhe
 * ao lado da capa; aqui ele ocupa a tela inteira, e movimento contínuo dessa área é
 * justamente o que a preferência pede para desligar. Com ela ativa o disco fica parado no
 * ângulo zero — continua sendo um vinil, só não gira.
 *
 * É o segundo tema a derivar rotação do relógio de reprodução. Um terceiro justifica
 * mover isto para `themes/core`, como já aconteceu com a amostragem da capa.
 */
export function useVinylRotation(recordRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const paint = (): void => {
      const record = recordRef.current
      if (!record) return

      const turns = playbackClock.getPositionMs() / (secondsPerTurn * 1000)

      // O resto mantém o ângulo pequeno numa faixa longa; sem isso ele cresceria sem
      // limite e perderia precisão de ponto flutuante ao longo de horas de reprodução.
      record.style.setProperty('--vinyl-rotation', `${(turns % 1) * 360}deg`)
    }

    const synchronize = (): (() => void) | undefined => {
      if (reducedMotion.matches) {
        recordRef.current?.style.setProperty('--vinyl-rotation', '0deg')
        return undefined
      }

      paint()
      return playbackClock.subscribe(paint)
    }

    let unsubscribe = synchronize()

    // A preferência pode mudar com o aplicativo aberto; o disco precisa parar e voltar a
    // girar sem depender de uma remontagem do tema.
    const handlePreferenceChange = (): void => {
      unsubscribe?.()
      unsubscribe = synchronize()
    }

    reducedMotion.addEventListener('change', handlePreferenceChange)

    return () => {
      unsubscribe?.()
      reducedMotion.removeEventListener('change', handlePreferenceChange)
    }
  }, [recordRef])
}
