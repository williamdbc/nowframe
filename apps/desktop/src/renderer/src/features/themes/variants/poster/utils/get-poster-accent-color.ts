import type { RgbColor } from './get-readable-text-color'

/**
 * Cor de destaque do tema: a média da capa, na luminosidade que ela tem de fato.
 *
 * Diferente do tema Ambient — que força luminosidade fixa e escura para manter o texto
 * branco estável —, aqui o degradê precisa encontrar a arte sem costura, então a cor sai
 * como está e é o contraste WCAG que decide se o texto vira preto ou branco. Ver
 * `get-readable-text-color.ts`: a escolha nunca fica abaixo de 4.58:1, então não há
 * motivo para clarear ou escurecer o destaque para garantir legibilidade.
 *
 * O peso é maior na metade de baixo da amostra, que é onde o degradê realmente encosta
 * na imagem; sem isso uma capa com topo muito diferente do rodapé produzia uma emenda
 * visível.
 */
const minimumSampledAlpha = 125
const bottomHalfWeight = 3

/** Cinza neutro para capa ausente ou sem CORS: legível e sem identidade falsa. */
export const posterFallbackAccent: RgbColor = { blue: 26, green: 26, red: 27 }

export function getPosterAccentColor(pixels: Uint8ClampedArray, sampleSize: number): RgbColor {
  let redSum = 0
  let greenSum = 0
  let blueSum = 0
  let weightSum = 0

  for (let index = 0; index < pixels.length; index += 4) {
    if (pixels[index + 3] < minimumSampledAlpha) continue

    const row = Math.floor(index / 4 / sampleSize)
    const weight = row >= sampleSize / 2 ? bottomHalfWeight : 1

    redSum += pixels[index] * weight
    greenSum += pixels[index + 1] * weight
    blueSum += pixels[index + 2] * weight
    weightSum += weight
  }

  if (weightSum === 0) return posterFallbackAccent

  return {
    blue: Math.round(blueSum / weightSum),
    green: Math.round(greenSum / weightSum),
    red: Math.round(redSum / weightSum)
  }
}
