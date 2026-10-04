import { useState } from 'react'
import { act, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

import { ThemeSelector } from '@/features/themes/core/components/theme-selector'
import { availableThemes } from '@/features/themes/core/theme-registry'
import type { PlayerThemeId } from '@/features/themes/core/types/player-theme'

import { installThemeShowcase, runThemeShowcase } from './showcase-themes'

afterEach(() => vi.useRealTimers())

function DemoPage(): React.JSX.Element {
  const [theme, setTheme] = useState<PlayerThemeId>('ambient')

  return <ThemeSelector activeThemeId={theme} onSelectTheme={setTheme} themes={availableThemes} />
}

it('selects visible themes through the real menu and restores the initial theme', async () => {
  vi.useFakeTimers()
  render(<DemoPage />)
  const cursor = document.createElement('div')
  const selected: string[] = []
  let clickedPosition = ''
  const events = new AbortController()
  document.addEventListener(
    'click',
    function record(event) {
      const target = event.target as HTMLElement
      if (target.dataset.demoTheme) {
        selected.push(target.dataset.demoTheme)
        clickedPosition = cursor.style.transform
      }
    },
    { signal: events.signal }
  )

  const run = runThemeShowcase(cursor, new AbortController().signal, {
    countdownMs: 0,
    movementMs: 0,
    menuPauseMs: 0,
    exposureMs: 2,
    scrollMs: 0
  })
  for (let step = 0; step < 100; step++) {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100)
    })
  }
  await run
  events.abort()

  expect(selected).toEqual([
    'cd-cover',
    'default',
    'drive',
    'karaoke',
    'lyrics',
    'minimalist',
    'poster',
    'setlist',
    'spotlight',
    'tracklist',
    'vinyl',
    'arcade-select',
    'ambient'
  ])
  expect(cursor.style.transform).toBe(clickedPosition)
  expect(screen.getByRole('button', { name: 'Ambient' })).toHaveAttribute('aria-expanded', 'false')
})

it('stops before selecting a theme when interrupted during the countdown', async () => {
  vi.useFakeTimers()
  render(<DemoPage />)
  const controller = new AbortController()
  const run = runThemeShowcase(document.createElement('div'), controller.signal)
  controller.abort()
  await expect(run).rejects.toMatchObject({ name: 'AbortError' })
  expect(screen.getByRole('button', { name: 'Ambient' })).toHaveAttribute('aria-expanded', 'false')
})

it('starts the simulated cursor at the latest real mouse position', async () => {
  vi.useFakeTimers()
  render(<DemoPage />)
  installThemeShowcase()
  expect(document.querySelector('.demo-notice')).not.toBeInTheDocument()
  window.dispatchEvent(new MouseEvent('mousemove', { clientX: 140, clientY: 90 }))
  window.dispatchEvent(new MouseEvent('mousemove', { clientX: 320, clientY: 240 }))
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F8' }))

  expect(document.querySelector<HTMLElement>('.demo-cursor')?.style.transform).toBe(
    'translate3d(320px, 240px, 0)'
  )

  await act(async () => {
    await vi.advanceTimersByTimeAsync(0)
  })
  expect(document.querySelector<HTMLElement>('.demo-cursor')?.style.transform).not.toBe(
    'translate3d(320px, 240px, 0)'
  )

  await act(async () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await vi.runAllTimersAsync()
  })
  expect(document.querySelector('.demo-cursor')).not.toBeInTheDocument()
  expect(document.querySelector('.demo-notice')).not.toBeInTheDocument()
})
