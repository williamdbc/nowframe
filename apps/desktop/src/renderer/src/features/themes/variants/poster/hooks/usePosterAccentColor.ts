import { useEffect, useState } from 'react'

import { getPosterAccentColor, posterFallbackAccent } from '../utils/get-poster-accent-color'
import type { RgbColor } from '../utils/get-readable-text-color'

/**
 * Amostra a capa em resolução reduzida: 32x32 já descreve a distribuição de cor da arte
 * e mantém a leitura do canvas barata o suficiente para rodar a cada troca de faixa.
 *
 * A amostragem repete a do tema Ambient (`useDominantCoverColor`) porque cada tema deriva
 * uma cor diferente dos mesmos pixels. Se um terceiro tema precisar disso, vale extrair o
 * amostrador para `themes/core` em vez de copiar de novo.
 */
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
    // A CDN do Spotify responde com Access-Control-Allow-Origin; sem isso o canvas fica
    // marcado e getImageData lança SecurityError.
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
        // Capa de origem sem CORS: o destaque neutro continua legível.
      }
    }

    image.src = imageUrl

    return () => {
      isCurrent = false
    }
  }, [imageUrl])

  // Enquanto a amostragem da capa atual não chega, o destaque neutro vale: assim a cor da
  // faixa anterior nunca vaza para a próxima.
  return sampled?.imageUrl === imageUrl && imageUrl ? sampled.color : posterFallbackAccent
}
