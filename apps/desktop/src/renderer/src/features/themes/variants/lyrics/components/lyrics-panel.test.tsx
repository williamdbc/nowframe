import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { LyricsPanel } from './lyrics-panel'

const syncedLyrics = {
  status: 'synced' as const,
  plainLines: ['First line', 'Second line'],
  syncedLines: [
    { startTimeMs: 1_000, text: 'First line' },
    { startTimeMs: 2_500, text: 'Second line' }
  ],
  wordSyncedLines: []
}

beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
    configurable: true,
    value: vi.fn()
  })
})

describe('LyricsPanel', () => {
  it('highlights and follows the line matching playback progress', () => {
    const { rerender } = render(
      <LyricsPanel isPlaying={false} lyrics={syncedLyrics} positionMs={1_500} />
    )

    expect(screen.getByText('First line')).toHaveAttribute('aria-current', 'true')
    expect(screen.getByText('Second line')).not.toHaveAttribute('aria-current')

    rerender(<LyricsPanel isPlaying={false} lyrics={syncedLyrics} positionMs={2_500} />)

    expect(screen.getByText('First line')).not.toHaveAttribute('aria-current')
    expect(screen.getByText('Second line')).toHaveAttribute('aria-current', 'true')
    expect(HTMLElement.prototype.scrollTo).toHaveBeenCalled()
  })

  it('shows a specific empty state for a track without lyrics', () => {
    render(
      <LyricsPanel
        isPlaying={false}
        lyrics={{ status: 'not-found', plainLines: [], syncedLines: [] }}
        positionMs={0}
      />
    )

    expect(screen.getByText('Não encontramos a letra desta versão da música.')).toBeVisible()
  })

  it('hides unsynchronized lyrics while the theme option is disabled', () => {
    render(
      <LyricsPanel
        isPlaying={false}
        lyrics={{ status: 'plain', plainLines: ['Unsynchronized line'], syncedLines: [] }}
        positionMs={0}
      />
    )

    expect(screen.getByText('Esta música não possui letra sincronizada.')).toBeVisible()
    expect(screen.queryByText('Unsynchronized line')).not.toBeInTheDocument()
  })
})
