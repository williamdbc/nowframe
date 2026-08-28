import { describe, expect, it } from 'vitest'

import { ambientFallbackBackdrop, getDominantCoverColor } from './get-dominant-cover-color'

function createPixels(colors: readonly (readonly [number, number, number])[]): Uint8ClampedArray {
  const pixels = new Uint8ClampedArray(colors.length * 4)

  colors.forEach(([red, green, blue], index) => {
    pixels.set([red, green, blue, 255], index * 4)
  })

  return pixels
}

function getLightness(hex: string): number {
  const red = Number.parseInt(hex.slice(1, 3), 16) / 255
  const green = Number.parseInt(hex.slice(3, 5), 16) / 255
  const blue = Number.parseInt(hex.slice(5, 7), 16) / 255
  return (Math.max(red, green, blue) + Math.min(red, green, blue)) / 2
}

function toChannels(hex: string): [number, number, number] {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16)
  ]
}

describe('getDominantCoverColor', () => {
  it('ignores pure white and pure black, which carry no identity of the cover', () => {
    const pixels = createPixels([
      [255, 255, 255],
      [255, 255, 255],
      [0, 0, 0],
      [0, 0, 0]
    ])

    expect(getDominantCoverColor(pixels)).toBe(ambientFallbackBackdrop)
  })

  it('falls back when the cover has no saturated pixel to build a backdrop from', () => {
    const pixels = createPixels([
      [128, 128, 128],
      [130, 130, 130],
      [126, 126, 126]
    ])

    expect(getDominantCoverColor(pixels)).toBe(ambientFallbackBackdrop)
  })

  it('keeps the dominant hue of the cover', () => {
    const warmCover = createPixels([
      [255, 140, 0],
      [240, 130, 10],
      [230, 120, 5]
    ])
    const coolCover = createPixels([
      [0, 120, 255],
      [10, 130, 240],
      [5, 110, 230]
    ])

    const [warmRed, , warmBlue] = toChannels(getDominantCoverColor(warmCover))
    const [coolRed, , coolBlue] = toChannels(getDominantCoverColor(coolCover))

    expect(warmRed).toBeGreaterThan(warmBlue)
    expect(coolBlue).toBeGreaterThan(coolRed)
  })

  it('normalizes the backdrop to a dark lightness so white text stays readable', () => {
    const brightCover = createPixels([
      [255, 200, 120],
      [250, 205, 130],
      [255, 210, 125]
    ])

    expect(getLightness(getDominantCoverColor(brightCover))).toBeCloseTo(0.14, 1)
  })

  it('lifts a barely saturated cover to a minimum saturation instead of going grey', () => {
    const mutedCover = createPixels([
      [140, 128, 120],
      [138, 126, 118],
      [142, 130, 122]
    ])

    const [red, , blue] = toChannels(getDominantCoverColor(mutedCover))

    expect(red).toBeGreaterThan(blue)
  })
})
