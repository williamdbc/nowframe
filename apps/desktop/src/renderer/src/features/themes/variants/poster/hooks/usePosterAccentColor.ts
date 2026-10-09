import { useEffect, useState } from 'react'

import { getPosterAccentColor, posterFallbackAccent } from '../utils/get-poster-accent-color'
import type { RgbColor } from '../utils/get-readable-text-color'

const sampleSize = 32

interface SampledAccent {
  color: RgbColor
  imageUrl: string
}

export function usePosterAccentColor(imageUrl: string | null): RgbColor {
  const [sampled, setSampled] = useState<SampledAccent | null>(null)

  useEffect(() => {
    if (!imageUrl) return undefined

    let isCurrent = true
    const image = new Image()

    image.crossOrigin = 'anonymous'

    image.onload = () => {
      if (!isCurrent) return

      const canvas = document.createElement('canvas')
      canvas.width = sampleSize
      canvas.height = sampleSize

      const context = canvas.getContext('2d', { willReadFrequently: true })
      if (!context) return

      try {
        context.drawImage(image, 0, 0, sampleSize, sampleSize)
        const { data } = context.getImageData(0, 0, sampleSize, sampleSize)
        setSampled({ color: getPosterAccentColor(data, sampleSize), imageUrl })
      } catch {
        // Keep the fallback when canvas sampling is unavailable.
      }
    }

    image.src = imageUrl

    return () => {
      isCurrent = false
    }
  }, [imageUrl])

  return sampled?.imageUrl === imageUrl && imageUrl ? sampled.color : posterFallbackAccent
}
