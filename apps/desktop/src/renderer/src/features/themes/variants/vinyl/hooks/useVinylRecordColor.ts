import { useSampledCoverPixels } from '@/features/themes/core/hooks/useSampledCoverPixels'

import { getVinylRecordColor, vinylFallbackRecord } from '../utils/get-vinyl-record-color'
import type { VinylRecordColor } from '../utils/get-vinyl-record-color'

/**
 * Cor do disco e do sulco a partir da capa. Enquanto a amostra não chega — sem capa, antes
 * da primeira leitura, ou com o canvas marcado por falta de CORS — vale o vinil preto, que
 * é um estado legítimo do objeto e não um placeholder à espera de cor.
 */
export function useVinylRecordColor(imageUrl: string | null): VinylRecordColor {
  const pixels = useSampledCoverPixels(imageUrl)
  if (!pixels) return vinylFallbackRecord

  return getVinylRecordColor(pixels)
}
