import {
  clampBackdropSaturation,
  getDominantCoverHue,
  toHslHex
} from '@/features/themes/variants/ambient/utils/get-dominant-cover-color'

/**
 * As duas cores do disco, derivadas da capa.
 *
 * O Figma pinta a referência com #312a17 no corpo e #82703d no sulco. Em HSL são
 * hsl(44, 36%, 14%) e hsl(44, 36%, 37.5%): mesma matiz, mesma saturação, só a
 * luminosidade muda. É essa a regra implementada aqui — a arte empresta matiz e croma, o
 * desenho fixa as duas claridades.
 *
 * A matiz sai do mesmo agrupamento do tema Ambient, reusado em vez de reescrito. O corpo
 * do disco cai exatamente na luminosidade do fundo do Ambient, o que não é coincidência:
 * os dois desenhos partem da mesma cor de referência.
 */
const recordLightness = 0.14
const grooveLightness = 0.375

/**
 * Capa ausente, sem croma ou sem CORS: um disco preto de sulco cinza. Diferente do CD, um
 * vinil sem cor não parece defeito — é o vinil comum.
 */
export const vinylFallbackRecord: VinylRecordColor = {
  groove: '#5f5f5f',
  record: '#1b1a19'
}

export interface VinylRecordColor {
  groove: string
  record: string
}

export function getVinylRecordColor(pixels: Uint8ClampedArray): VinylRecordColor {
  const dominant = getDominantCoverHue(pixels)
  if (!dominant) return vinylFallbackRecord

  const saturation = clampBackdropSaturation(dominant.saturation)

  return {
    groove: toHslHex(dominant.hue, saturation, grooveLightness),
    record: toHslHex(dominant.hue, saturation, recordLightness)
  }
}
