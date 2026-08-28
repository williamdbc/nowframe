import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { availableThemes } from '../theme-registry'
import { ThemeSelector } from './theme-selector'

describe('ThemeSelector', () => {
  it('lists every registered theme and selects a different layout', async () => {
    const user = userEvent.setup()
    const onSelectTheme = vi.fn()
    render(
      <ThemeSelector
        activeThemeId="default"
        onSelectTheme={onSelectTheme}
        themes={availableThemes}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Default' }))
    expect(screen.getByRole('menu', { name: 'Temas' })).toBeInTheDocument()
    expect(screen.getAllByRole('menuitemradio')).toHaveLength(availableThemes.length)
    expect(screen.getByRole('menuitemradio', { name: 'Ambient' })).toBeVisible()
    expect(screen.getByRole('menuitemradio', { name: 'Karaoke' })).toBeVisible()
    expect(screen.getByRole('menuitemradio', { name: 'Lyrics' })).toBeVisible()
    expect(screen.getByRole('menuitemradio', { name: 'Tracklist' })).toBeVisible()

    await user.click(screen.getByRole('menuitemradio', { name: 'Drive' }))
    expect(onSelectTheme).toHaveBeenCalledWith('drive')
    expect(screen.queryByRole('menu', { name: 'Temas' })).not.toBeInTheDocument()
  })
})
