import { useEffect, useState } from 'react'

/**
 * Amostra a capa em resolução reduzida e devolve os pixels crus. 32x32 já descreve a
 * distribuição de cor da arte e mantém a leitura do canvas barata o suficiente para rodar
 * a cada troca de faixa.
 *
 * Fica em `themes/core` porque três temas derivam cores diferentes dos mesmos pixels: o
 * Ambient força uma luminosidade escura fixa, o Poster usa a média na luminosidade real, e
 * o CD Cover tinge o disco. O que varia é o cálculo, não a amostragem.
 */
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
    // A CDN do Spotify responde com Access-Control-Allow-Origin; sem isso o canvas fica
    // marcado e getImageData lança SecurityError.
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
        // Capa de origem sem CORS: quem consome cai no próprio fallback.
      }
    }

    image.src = imageUrl

    return () => {
      isCurrent = false
    }
  }, [imageUrl])

  // Enquanto a amostragem da capa atual não chega, nada é devolvido: assim a cor da faixa
  // anterior nunca vaza para a próxima.
  return sampled?.imageUrl === imageUrl && imageUrl ? sampled.pixels : null
}
