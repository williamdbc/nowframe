import { useEffect, useState } from 'react'

export const coverSampleSize = 32

interface SampledCover {
  imageUrl: string
  pixels: Uint8ClampedArray
}

export function useSampledCoverPixels(imageUrl: string | null): Uint8ClampedArray | null {
  const [sampled, setSampled] = useState<SampledCover | null>(null)

  useEffect(() => {
    if (!imageUrl) return undefined

    let isCurrent = true
    const image = new Image()

    image.crossOrigin = 'anonymous'

    image.onload = () => {
      if (!isCurrent) return

      const canvas = document.createElement('canvas')
      canvas.width = coverSampleSize
      canvas.height = coverSampleSize

      const context = canvas.getContext('2d', { willReadFrequently: true })
      if (!context) return

      try {
        context.drawImage(image, 0, 0, coverSampleSize, coverSampleSize)
        const { data } = context.getImageData(0, 0, coverSampleSize, coverSampleSize)
        setSampled({ imageUrl, pixels: data })
      } catch {
        // Keep the fallback when canvas sampling is unavailable.
      }
    }

    image.src = imageUrl

    return () => {
      isCurrent = false
    }
  }, [imageUrl])

  return sampled?.imageUrl === imageUrl && imageUrl ? sampled.pixels : null
}
