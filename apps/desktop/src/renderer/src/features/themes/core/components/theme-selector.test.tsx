import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { availableThemes } from '../theme-registry'
import { ThemeSelector } from './theme-selector'

const originalScrollIntoView = HTMLElement.prototype.scrollIntoView

beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn()
  })
})

afterEach(() => {
  if (originalScrollIntoView) {
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: originalScrollIntoView
    })
    return
  }

  Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView')
})

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
    expect(screen.getByRole('group', { name: 'Principais' })).toBeVisible()
    expect(screen.getByRole('group', { name: 'Conceituais' })).toBeVisible()
    expect(screen.getAllByRole('menuitemradio')).toHaveLength(availableThemes.length)
    expect(screen.getByRole('menuitemradio', { name: 'Ambient' })).toBeVisible()
    expect(screen.getByRole('menuitemradio', { name: 'Arcade Select' })).toBeVisible()
    expect(screen.getByRole('menuitemradio', { name: 'Cassette' })).toBeVisible()
    expect(screen.getByRole('menuitemradio', { name: 'Karaoke' })).toBeVisible()
    expect(screen.getByRole('menuitemradio', { name: 'Lyrics' })).toBeVisible()
    expect(screen.getByRole('menuitemradio', { name: 'CD Cover' })).toBeVisible()
    expect(screen.getByRole('menuitemradio', { name: 'Poster' })).toBeVisible()
    expect(screen.getByRole('menuitemradio', { name: 'Rocket League' })).toBeVisible()
    expect(screen.getByRole('menuitemradio', { name: 'Setlist' })).toBeVisible()
    expect(screen.getByRole('menuitemradio', { name: 'Spotlight' })).toBeVisible()
    expect(screen.getByRole('menuitemradio', { name: 'Tracklist' })).toBeVisible()

    await user.click(screen.getByRole('menuitemradio', { name: 'Drive' }))
    expect(onSelectTheme).toHaveBeenCalledWith('drive')
    expect(screen.queryByRole('menu', { name: 'Temas' })).not.toBeInTheDocument()
  })

  it('keeps a long list scrollable and reveals the active theme when opened', async () => {
    const user = userEvent.setup()

    render(
      <ThemeSelector activeThemeId="tracklist" onSelectTheme={vi.fn()} themes={availableThemes} />
    )

    await user.click(screen.getByRole('button', { name: 'Tracklist' }))

    const menu = screen.getByRole('menu', { name: 'Temas' })
    const scrollContainer = menu.firstElementChild
    const activeTheme = screen.getByRole('menuitemradio', { name: 'Tracklist' })

    expect(scrollContainer).toHaveClass('overflow-y-auto')
    expect(scrollContainer).toHaveClass('max-h-[min(70vh,28rem)]')
    expect(activeTheme).toHaveAttribute('aria-checked', 'true')
    expect(activeTheme.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'auto',
      block: 'nearest',
      inline: 'nearest'
    })
  })
})
