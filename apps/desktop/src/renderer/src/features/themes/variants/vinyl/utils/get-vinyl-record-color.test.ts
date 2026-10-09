import { describe, expect, it } from 'vitest'

import { getVinylRecordColor, vinylFallbackRecord } from './get-vinyl-record-color'

function createPixels(colors: readonly (readonly [number, number, number])[]): Uint8ClampedArray {
  const pixels = new Uint8ClampedArray(colors.length * 4)

  colors.forEach(([red, green, blue], index) => {
    pixels.set([red, green, blue, 255], index * 4)
  })

  return pixels
}

function toHsl(hex: string): { hue: number; lightness: number; saturation: number } {
  const red = Number.parseInt(hex.slice(1, 3), 16) / 255
  const green = Number.parseInt(hex.slice(3, 5), 16) / 255
  const blue = Number.parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const delta = max - min
  const lightness = (max + min) / 2

  if (delta === 0) return { hue: 0, lightness, saturation: 0 }

  const saturation = delta / (1 - Math.abs(2 * lightness - 1))
  let hue: number

  if (max === red) hue = 60 * (((green - blue) / delta) % 6)
  else if (max === green) hue = 60 * ((blue - red) / delta + 2)
  else hue = 60 * ((red - green) / delta + 4)

  return { hue: (hue + 360) % 360, lightness, saturation }
}

describe('getVinylRecordColor', () => {
  it('keeps the groove on the hue and saturation of the record body', () => {
    const pixels = createPixels([
      [180, 60, 40],
      [190, 70, 45],
      [175, 55, 38]
    ])

    const { groove, record } = getVinylRecordColor(pixels)
    const grooveHsl = toHsl(groove)
    const recordHsl = toHsl(record)

    expect(Math.abs(grooveHsl.hue - recordHsl.hue)).toBeLessThan(1)
    expect(grooveHsl.saturation).toBeCloseTo(recordHsl.saturation, 1)
    expect(grooveHsl.lightness).toBeGreaterThan(recordHsl.lightness)
  })

  it('holds both lightnesses regardless of how light or dark the cover is', () => {
    const darkCover = getVinylRecordColor(createPixels([[40, 20, 90]]))
    const lightCover = getVinylRecordColor(createPixels([[230, 200, 120]]))

    for (const { groove, record } of [darkCover, lightCover]) {
      expect(toHsl(record).lightness).toBeCloseTo(0.14, 2)
      expect(toHsl(groove).lightness).toBeCloseTo(0.375, 2)
    }
  })

  it('returns the plain black record for a cover without chroma', () => {
    const pixels = createPixels([
      [120, 120, 120],
      [80, 80, 80]
    ])

    expect(getVinylRecordColor(pixels)).toEqual(vinylFallbackRecord)
  })

  it('reproduces the reference colours of the design', () => {
    const { groove, record } = getVinylRecordColor(createPixels([[130, 112, 61]]))

    expect(record).toBe('#312a17')
    expect(groove).toBe('#82703d')
  })
})
