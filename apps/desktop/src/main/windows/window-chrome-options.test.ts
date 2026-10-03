import { describe, expect, it } from 'vitest'

import { getWindowChromeOptions } from './window-chrome-options'

describe('getWindowChromeOptions', () => {
  it('embeds the native traffic lights into the content on macOS', () => {
    expect(getWindowChromeOptions('darwin')).toEqual({
      titleBarStyle: 'hiddenInset',
      trafficLightPosition: { x: 16, y: 16 }
    })
  })

  it.each(['win32', 'linux'] as const)(
    'embeds native window controls into the content on %s',
    (platform) => {
      expect(getWindowChromeOptions(platform)).toEqual({
        titleBarStyle: 'hidden',
        titleBarOverlay: {
          color: '#00000000',
          symbolColor: '#ffffff',
          height: 44
        }
      })
    }
  )
})
