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

export function toRgbChannels({ blue, green, red }: RgbColor): string {
  return `${red} ${green} ${blue}`
}
