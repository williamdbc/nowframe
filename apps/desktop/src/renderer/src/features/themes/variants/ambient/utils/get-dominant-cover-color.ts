/**
 * O tema Ambient pinta o fundo com a cor predominante da capa do álbum.
 * O Figma define esse fundo como #312a17 para a capa de referência, que em HSL
 * é hsl(44, 36%, 14%): a matiz vem da arte, a luminosidade é fixa para manter o
 * contraste do texto branco estável em qualquer capa.
 */
const backdropLightness = 0.14
const minimumBackdropSaturation = 0.18
const maximumBackdropSaturation = 0.42

/** Pixels quase brancos ou quase pretos não definem a identidade da capa. */
const maximumSampledLightness = 0.92
const minimumSampledLightness = 0.06
const minimumSampledSaturation = 0.12
const minimumSampledAlpha = 125

const hueBucketCount = 24
const hueBucketSize = 360 / hueBucketCount

export const ambientFallbackBackdrop = '#1b1a19'

interface HueBucket {
  weight: number
  hueX: number
  hueY: number
  saturationSum: number
}

interface HslColor {
  hue: number
  saturation: number
  lightness: number
}

/**
 * Matiz e saturação predominantes da capa, sem luminosidade: quem consome decide em que
 * claridade pintar. O Ambient usa uma só, escura e fixa; o Vinyl usa duas, o corpo do
 * disco e o sulco.
 */
export interface DominantCoverHue {
  hue: number
  saturation: number
}

function toHsl(red: number, green: number, blue: number): HslColor {
  const normalizedRed = red / 255
  const normalizedGreen = green / 255
  const normalizedBlue = blue / 255
  const max = Math.max(normalizedRed, normalizedGreen, normalizedBlue)
  const min = Math.min(normalizedRed, normalizedGreen, normalizedBlue)
  const delta = max - min
  const lightness = (max + min) / 2

  if (delta === 0) return { hue: 0, saturation: 0, lightness }

  const saturation = delta / (1 - Math.abs(2 * lightness - 1))
  let hue: number

  if (max === normalizedRed) {
    hue = 60 * (((normalizedGreen - normalizedBlue) / delta) % 6)
  } else if (max === normalizedGreen) {
    hue = 60 * ((normalizedBlue - normalizedRed) / delta + 2)
  } else {
    hue = 60 * ((normalizedRed - normalizedGreen) / delta + 4)
  }

  return { hue: (hue + 360) % 360, saturation, lightness }
}

export function toHslHex(hue: number, saturation: number, lightness: number): string {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
  const secondary = chroma * (1 - Math.abs(((hue / 60) % 2) - 1))
  const offset = lightness - chroma / 2
  const sector = Math.floor(hue / 60) % 6
  const [red, green, blue] = [
    [chroma, secondary, 0],
    [secondary, chroma, 0],
    [0, chroma, secondary],
    [0, secondary, chroma],
    [secondary, 0, chroma],
    [chroma, 0, secondary]
  ][sector]

  const toChannel = (value: number): string =>
    Math.round((value + offset) * 255)
      .toString(16)
      .padStart(2, '0')

  return `#${toChannel(red)}${toChannel(green)}${toChannel(blue)}`
}

/**
 * Agrupa os pixels por matiz e escolhe o grupo de maior peso, onde o peso é a
 * saturação acumulada. Somar saturação em vez de contar pixels evita que uma
 * capa majoritariamente cinza devolva um fundo sem identidade.
 *
 * As matizes são somadas como vetores no círculo cromático para que o vermelho,
 * que fica nas duas pontas da escala, não seja partido em dois grupos opostos.
 *
 * Devolve `null` quando nenhum pixel carrega croma suficiente: uma arte preto e branco
 * não tem matiz para emprestar, e cada tema decide o que fazer com essa ausência.
 */
export function getDominantCoverHue(pixels: Uint8ClampedArray): DominantCoverHue | null {
  const buckets = new Map<number, HueBucket>()

  for (let index = 0; index < pixels.length; index += 4) {
    const alpha = pixels[index + 3]
    if (alpha < minimumSampledAlpha) continue

    const { hue, saturation, lightness } = toHsl(
      pixels[index],
      pixels[index + 1],
      pixels[index + 2]
    )
    if (lightness > maximumSampledLightness || lightness < minimumSampledLightness) continue
    if (saturation < minimumSampledSaturation) continue

    const bucketIndex = Math.floor(hue / hueBucketSize)
    const bucket = buckets.get(bucketIndex) ?? { weight: 0, hueX: 0, hueY: 0, saturationSum: 0 }
    const radians = (hue * Math.PI) / 180

    bucket.weight += saturation
    bucket.hueX += Math.cos(radians) * saturation
    bucket.hueY += Math.sin(radians) * saturation
    bucket.saturationSum += saturation * saturation
    buckets.set(bucketIndex, bucket)
  }

  let dominant: HueBucket | null = null
  for (const bucket of buckets.values()) {
    if (!dominant || bucket.weight > dominant.weight) dominant = bucket
  }

  if (!dominant || dominant.weight === 0) return null

  return {
    hue: ((Math.atan2(dominant.hueY, dominant.hueX) * 180) / Math.PI + 360) % 360,
    saturation: dominant.saturationSum / dominant.weight
  }
}

/**
 * A saturação da capa entra numa janela estreita: abaixo do mínimo a arte perde
 * identidade no fundo, acima do máximo ela vira uma cor de aviso atrás do texto.
 */
export function clampBackdropSaturation(saturation: number): number {
  return Math.min(maximumBackdropSaturation, Math.max(minimumBackdropSaturation, saturation))
}

export function getDominantCoverColor(pixels: Uint8ClampedArray): string {
  const dominant = getDominantCoverHue(pixels)
  if (!dominant) return ambientFallbackBackdrop

  return toHslHex(dominant.hue, clampBackdropSaturation(dominant.saturation), backdropLightness)
}
