import { useEffect } from 'react'
import type { RefObject } from 'react'

import { playbackClock } from '@/features/playback/utils/playback-clock'

/**
 * Quantos segundos de música cabem numa volta do disco. Uma volta por faixa inteira — a
 * leitura literal de "uma rotação na duração da música" — dá pouco mais de um grau por
 * segundo numa faixa de cinco minutos, o que na tela é indistinguível de um disco parado.
 * Aqui a volta tem duração fixa, então o giro é visível e a velocidade não muda de uma
 * faixa curta para uma longa.
 */
const secondsPerTurn = 16

/**
 * O ângulo vem da posição de reprodução, não de uma animação CSS de duração fixa. Isso
 * resolve três casos que a animação erraria: pausar congela o disco no ângulo certo, um
 * seek reposiciona em vez de continuar de onde parou, e trocar de faixa recomeça do zero.
 *
 * A escrita é direta no DOM, sem passar pelo React: são 60 atualizações por segundo, e
 * re-renderizar a árvore do tema nessa cadência era exatamente o que a barra de progresso
 * deixou de fazer.
 */
export function useCdDiscRotation(discRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const paint = (): void => {
      const disc = discRef.current
      if (!disc) return

      const turns = playbackClock.getPositionMs() / (secondsPerTurn * 1000)

      // O resto mantém o ângulo pequeno numa faixa longa; sem isso ele cresceria sem
      // limite e perderia precisão de ponto flutuante ao longo de horas de reprodução.
      disc.style.setProperty('--cd-disc-rotation', `${(turns % 1) * 360}deg`)
    }

    paint()

    return playbackClock.subscribe(paint)
  }, [discRef])
}
