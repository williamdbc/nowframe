const backdropLightness = 0.14
const minimumBackdropSaturation = 0.18
const maximumBackdropSaturation = 0.42

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

export function clampBackdropSaturation(saturation: number): number {
  return Math.min(maximumBackdropSaturation, Math.max(minimumBackdropSaturation, saturation))
}

export function getDominantCoverColor(pixels: Uint8ClampedArray): string {
  const dominant = getDominantCoverHue(pixels)
  if (!dominant) return ambientFallbackBackdrop

  return toHslHex(dominant.hue, clampBackdropSaturation(dominant.saturation), backdropLightness)
}
