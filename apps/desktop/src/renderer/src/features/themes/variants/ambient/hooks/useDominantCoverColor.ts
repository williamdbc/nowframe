import { useEffect, useState } from 'react'

import { ambientFallbackBackdrop, getDominantCoverColor } from '../utils/get-dominant-cover-color'

/**
 * Amostra a capa em resolução reduzida: 32x32 já descreve a distribuição de cor
 * da arte e mantém a leitura do canvas barata o suficiente para rodar a cada
 * troca de faixa.
 */
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
    // A CDN do Spotify responde com Access-Control-Allow-Origin; sem isso o
    // canvas fica marcado e getImageData lança SecurityError.
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
        // Capa de origem sem CORS: o fundo neutro continua legível.
      }
    }

    image.src = imageUrl

    return () => {
      isCurrent = false
    }
  }, [imageUrl])

  // Enquanto a amostragem da capa atual não chega, o fundo neutro vale: assim a
  // cor da faixa anterior nunca vaza para a próxima.
  return sampled?.imageUrl === imageUrl && imageUrl ? sampled.color : ambientFallbackBackdrop
}
