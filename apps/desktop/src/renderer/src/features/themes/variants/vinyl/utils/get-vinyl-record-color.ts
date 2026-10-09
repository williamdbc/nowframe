import {
  clampBackdropSaturation,
  getDominantCoverHue,
  toHslHex
} from '@/features/themes/variants/ambient/utils/get-dominant-cover-color'

const recordLightness = 0.14
const grooveLightness = 0.375

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
