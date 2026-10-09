import {
  useSampledCoverPixels,
  coverSampleSize
} from '@/features/themes/core/hooks/useSampledCoverPixels'
import { getPosterAccentColor } from '@/features/themes/variants/poster/utils/get-poster-accent-color'

export function useCdCoverAccent(imageUrl: string | null): string | null {
  const pixels = useSampledCoverPixels(imageUrl)
  if (!pixels) return null

  const { red, green, blue } = getPosterAccentColor(pixels, coverSampleSize)
  return `rgb(${red} ${green} ${blue})`
}
