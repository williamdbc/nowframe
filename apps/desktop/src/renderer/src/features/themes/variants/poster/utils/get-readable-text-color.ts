/**
 * Escolha de preto ou branco sobre a cor de destaque da capa, pelo contraste da WCAG 2.1.
 *
 * A luminância relativa segue a definição da especificação: cada canal sRGB é
 * linearizado e depois ponderado por 0.2126 / 0.7152 / 0.0722.
 *
 * Vale registrar uma propriedade útil desta escolha: as duas curvas de contraste se
 * cruzam em luminância 0.179, onde ambas valem 4.58:1. Como sempre se toma a maior, o
 * contraste do texto nunca cai abaixo disso — ou seja, qualquer capa satisfaz o mínimo
 * de 4.5:1 da AA para texto normal, sem precisar clarear ou escurecer o destaque.
 */
export interface RgbColor {
  blue: number
  green: number
  red: number
}

export const readableBlack: RgbColor = { blue: 0, green: 0, red: 0 }
export const readableWhite: RgbColor = { blue: 255, green: 255, red: 255 }

function toLinearChannel(channel: number): number {
  const normalized = channel / 255
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
}

export function getRelativeLuminance({ blue, green, red }: RgbColor): number {
  return (
    0.2126 * toLinearChannel(red) + 0.7152 * toLinearChannel(green) + 0.0722 * toLinearChannel(blue)
  )
}

export function getContrastRatio(first: RgbColor, second: RgbColor): number {
  const firstLuminance = getRelativeLuminance(first)
  const secondLuminance = getRelativeLuminance(second)
  const lighter = Math.max(firstLuminance, secondLuminance)
  const darker = Math.min(firstLuminance, secondLuminance)

  return (lighter + 0.05) / (darker + 0.05)
}

export interface ReadableTextColor {
  color: RgbColor
  contrastRatio: number
  isDark: boolean
}

export function getReadableTextColor(background: RgbColor): ReadableTextColor {
  const blackContrast = getContrastRatio(background, readableBlack)
  const whiteContrast = getContrastRatio(background, readableWhite)
  const preferBlack = blackContrast >= whiteContrast

  return {
    color: preferBlack ? readableBlack : readableWhite,
    contrastRatio: preferBlack ? blackContrast : whiteContrast,
    isDark: preferBlack
  }
}

/** Componentes separados por espaço, para compor `rgb(var(--token) / alpha)` no CSS. */
export function toRgbChannels({ blue, green, red }: RgbColor): string {
  return `${red} ${green} ${blue}`
}
