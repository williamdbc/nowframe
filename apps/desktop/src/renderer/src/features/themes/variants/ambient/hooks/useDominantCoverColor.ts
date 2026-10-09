import { useEffect, useState } from 'react'

import { ambientFallbackBackdrop, getDominantCoverColor } from '../utils/get-dominant-cover-color'

const sampleSize = 32

interface SampledBackdrop {
  color: string
  imageUrl: string
}

export function useDominantCoverColor(imageUrl: string | null): string {
  const [sampled, setSampled] = useState<SampledBackdrop | null>(null)

  useEffect(() => {
    if (!imageUrl) return

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
        setSampled({ color: getDominantCoverColor(data), imageUrl })
      } catch {
        // Keep the fallback when canvas sampling is unavailable.
      }
    }

    image.src = imageUrl

    return () => {
      isCurrent = false
    }
  }, [imageUrl])

  return sampled?.imageUrl === imageUrl && imageUrl ? sampled.color : ambientFallbackBackdrop
}
