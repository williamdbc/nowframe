import { useSampledCoverPixels } from '@/features/themes/core/hooks/useSampledCoverPixels'

import { getVinylRecordColor, vinylFallbackRecord } from '../utils/get-vinyl-record-color'
import type { VinylRecordColor } from '../utils/get-vinyl-record-color'

export function useVinylRecordColor(imageUrl: string | null): VinylRecordColor {
  const pixels = useSampledCoverPixels(imageUrl)
  if (!pixels) return vinylFallbackRecord

  return getVinylRecordColor(pixels)
}
