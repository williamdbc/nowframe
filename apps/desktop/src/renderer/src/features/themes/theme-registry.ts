import { DefaultPlayerTheme } from './components/default-player-theme'
import type { PlayerTheme } from './types/player-theme'

export const defaultThemeId = 'default'

export const themeRegistry = {
  default: {
    id: defaultThemeId,
    name: 'Default',
    component: DefaultPlayerTheme
  }
} as const satisfies Record<string, PlayerTheme>
