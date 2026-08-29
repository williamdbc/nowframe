import {
  useSampledCoverPixels,
  coverSampleSize
} from '@/features/themes/core/hooks/useSampledCoverPixels'
import { getPosterAccentColor } from '@/features/themes/variants/poster/utils/get-poster-accent-color'

/**
 * Cor do disco: a média da capa, na luminosidade que ela tem de fato — o mesmo cálculo do
 * tema Poster, e por isso reusado em vez de reescrito.
 *
 * A camada de cor entra no disco com `mix-blend-mode: color`, que troca matiz e saturação
 * e preserva a luminosidade do PNG. Duas consequências que valem saber: o relevo do disco
 * (o brilho, o cubo, a borda) sobrevive à tintura, e uma capa sem croma — uma arte preto e
 * branco — devolve um disco prateado em vez de inventar uma cor.
 *
 * Devolve `null` enquanto não há amostra: sem capa, antes da primeira leitura, ou quando o
 * canvas fica marcado por falta de CORS. Uma cor neutra de reserva seria pior que nenhuma,
 * porque `color` com cinza não deixa o disco em paz — ele *tira* a iridescência e o disco
 * fica prateado, o que parece defeito.
 */
export function useCdCoverAccent(imageUrl: string | null): string | null {
  const pixels = useSampledCoverPixels(imageUrl)
  if (!pixels) return null

  const { red, green, blue } = getPosterAccentColor(pixels, coverSampleSize)
  return `rgb(${red} ${green} ${blue})`
}
