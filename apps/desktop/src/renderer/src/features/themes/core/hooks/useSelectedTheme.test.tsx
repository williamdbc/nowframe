import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { selectedThemeStorageKey, useSelectedTheme } from './useSelectedTheme'

const storedValues = new Map<string, string>()
const localStorageMock: Storage = {
  get length() {
    return storedValues.size
  },
  clear: () => storedValues.clear(),
  getItem: (key) => storedValues.get(key) ?? null,
  key: (index) => [...storedValues.keys()][index] ?? null,
  removeItem: (key) => storedValues.delete(key),
  setItem: (key, value) => storedValues.set(key, String(value))
}

beforeEach(() => {
  storedValues.clear()
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: localStorageMock
  })
})

describe('useSelectedTheme', () => {
  it('starts with Default and persists a valid selection', () => {
    const { result } = renderHook(() => useSelectedTheme())

    expect(result.current.activeThemeId).toBe('default')
    act(() => result.current.selectTheme('minimalist'))
    expect(result.current.activeThemeId).toBe('minimalist')
    expect(window.localStorage.getItem(selectedThemeStorageKey)).toBe('minimalist')
  })

  it('restores a valid theme and ignores unknown stored values', () => {
    window.localStorage.setItem(selectedThemeStorageKey, 'drive')
    const { result, unmount } = renderHook(() => useSelectedTheme())
    expect(result.current.activeThemeId).toBe('drive')
    unmount()

    window.localStorage.setItem(selectedThemeStorageKey, 'future-theme')
    const fallback = renderHook(() => useSelectedTheme())
    expect(fallback.result.current.activeThemeId).toBe('default')
  })
})
