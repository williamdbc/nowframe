import { describe, expect, it } from 'vitest'

import { getPosterAccentColor, posterFallbackAccent } from './get-poster-accent-color'

const sampleSize = 4

function buildSample(rowColors: Array<[number, number, number, number]>): Uint8ClampedArray {
  const pixels = new Uint8ClampedArray(sampleSize * sampleSize * 4)

  for (let row = 0; row < sampleSize; row += 1) {
    const [red, green, blue, alpha] = rowColors[row]

    for (let column = 0; column < sampleSize; column += 1) {
      const offset = (row * sampleSize + column) * 4
      pixels[offset] = red
      pixels[offset + 1] = green
      pixels[offset + 2] = blue
      pixels[offset + 3] = alpha
    }
  }

  return pixels
}

describe('getPosterAccentColor', () => {
  it('returns the colour of a flat cover unchanged', () => {
    const pixels = buildSample([
      [155, 170, 167, 255],
      [155, 170, 167, 255],
      [155, 170, 167, 255],
      [155, 170, 167, 255]
    ])

    expect(getPosterAccentColor(pixels, sampleSize)).toEqual({ blue: 167, green: 170, red: 155 })
  })

  it('weights the bottom half of the cover more than the top', () => {
    const pixels = buildSample([
      [0, 0, 0, 255],
      [0, 0, 0, 255],
      [200, 200, 200, 255],
      [200, 200, 200, 255]
    ])

    const accent = getPosterAccentColor(pixels, sampleSize)

    expect(accent.red).toBe(150)
  })

  it('ignores nearly transparent pixels', () => {
    const pixels = buildSample([
      [255, 0, 0, 0],
      [255, 0, 0, 0],
      [10, 20, 30, 255],
      [10, 20, 30, 255]
    ])

    expect(getPosterAccentColor(pixels, sampleSize)).toEqual({ blue: 30, green: 20, red: 10 })
  })

  it('falls back to the neutral accent when the cover is fully transparent', () => {
    const pixels = buildSample([
      [255, 255, 255, 0],
      [255, 255, 255, 0],
      [255, 255, 255, 0],
      [255, 255, 255, 0]
    ])

    expect(getPosterAccentColor(pixels, sampleSize)).toEqual(posterFallbackAccent)
  })
})
