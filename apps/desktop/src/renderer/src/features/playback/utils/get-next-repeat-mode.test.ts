import { describe, expect, it } from 'vitest'

import { getNextRepeatMode } from './get-next-repeat-mode'

describe('getNextRepeatMode', () => {
  it('cycles through context, track and off', () => {
    expect(getNextRepeatMode('off')).toBe('context')
    expect(getNextRepeatMode('context')).toBe('track')
    expect(getNextRepeatMode('track')).toBe('off')
  })
})
