import type { RgbColor } from './get-readable-text-color'

const minimumSampledAlpha = 125
const bottomHalfWeight = 3

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
