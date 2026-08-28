import { describe, expect, it } from 'vitest'

import {
  getContrastRatio,
  getReadableTextColor,
  getRelativeLuminance,
  readableBlack,
  readableWhite,
  toRgbChannels
} from './get-readable-text-color'

const rgb = (
  red: number,
  green: number,
  blue: number
): { blue: number; green: number; red: number } => ({
  blue,
  green,
  red
})

describe('getRelativeLuminance', () => {
  it('matches the WCAG reference values for black and white', () => {
    expect(getRelativeLuminance(readableBlack)).toBe(0)
    expect(getRelativeLuminance(readableWhite)).toBeCloseTo(1, 5)
  })

  it('weights green above red and red above blue', () => {
    const red = getRelativeLuminance(rgb(255, 0, 0))
    const green = getRelativeLuminance(rgb(0, 255, 0))
    const blue = getRelativeLuminance(rgb(0, 0, 255))

    expect(green).toBeGreaterThan(red)
    expect(red).toBeGreaterThan(blue)
  })
})

describe('getContrastRatio', () => {
  it('gives 21:1 between black and white', () => {
    expect(getContrastRatio(readableBlack, readableWhite)).toBeCloseTo(21, 4)
  })

  it('is symmetric', () => {
    const accent = rgb(155, 170, 167)

    expect(getContrastRatio(accent, readableBlack)).toBeCloseTo(
      getContrastRatio(readableBlack, accent),
      10
    )
  })
})

describe('getReadableTextColor', () => {
  /** O destaque da referência do Figma é claro, e o desenho usa texto preto. */
  it('picks black over the light accent from the reference cover', () => {
    const readable = getReadableTextColor(rgb(155, 170, 167))

    expect(readable.color).toEqual(readableBlack)
    expect(readable.isDark).toBe(true)
    expect(readable.contrastRatio).toBeGreaterThan(4.5)
  })

  it('picks white over a dark accent', () => {
    const readable = getReadableTextColor(rgb(27, 26, 26))

    expect(readable.color).toEqual(readableWhite)
    expect(readable.isDark).toBe(false)
    expect(readable.contrastRatio).toBeGreaterThan(4.5)
  })

  /**
   * A propriedade que dispensa clarear ou escurecer o destaque: as duas curvas de
   * contraste se cruzam em luminância 0.179, valendo 4.58:1. Como sempre se toma a
   * maior, nenhuma capa derruba o texto abaixo do mínimo de 4.5:1 da AA.
   */
  it('never falls below the AA minimum for body text, for any colour', () => {
    let worstRatio = Number.POSITIVE_INFINITY

    for (let red = 0; red <= 255; red += 15) {
      for (let green = 0; green <= 255; green += 15) {
        for (let blue = 0; blue <= 255; blue += 15) {
          worstRatio = Math.min(
            worstRatio,
            getReadableTextColor(rgb(red, green, blue)).contrastRatio
          )
        }
      }
    }

    expect(worstRatio).toBeGreaterThanOrEqual(4.5)
    // E o pior caso fica bem perto do cruzamento teórico das duas curvas.
    expect(worstRatio).toBeLessThan(5)
  })
})

describe('toRgbChannels', () => {
  it('emits space separated channels for the CSS token', () => {
    expect(toRgbChannels(rgb(155, 170, 167))).toBe('155 170 167')
  })
})
