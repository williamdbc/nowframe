import { useCallback, useState } from 'react'

import {
  defaultThemeId,
  isPlayerThemeId,
  themeRegistry
} from '@/features/themes/core/theme-registry'
import type { PlayerTheme, PlayerThemeId } from '@/features/themes/core/types/player-theme'

export const selectedThemeStorageKey = 'music-display:selected-theme'

function getStoredThemeId(): PlayerThemeId {
  const storedThemeId = window.localStorage.getItem(selectedThemeStorageKey)
  return storedThemeId && isPlayerThemeId(storedThemeId) ? storedThemeId : defaultThemeId
}

interface SelectedTheme {
  activeTheme: PlayerTheme
  activeThemeId: PlayerThemeId
  selectTheme: (themeId: PlayerThemeId) => void
}

export function useSelectedTheme(): SelectedTheme {
  const [activeThemeId, setActiveThemeId] = useState<PlayerThemeId>(getStoredThemeId)

  const selectTheme = useCallback((themeId: PlayerThemeId): void => {
    window.localStorage.setItem(selectedThemeStorageKey, themeId)
    setActiveThemeId(themeId)
  }, [])

  return {
    activeTheme: themeRegistry[activeThemeId],
    activeThemeId,
    selectTheme
  }
}
