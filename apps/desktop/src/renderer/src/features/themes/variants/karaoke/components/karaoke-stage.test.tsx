import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { LyricsDisplayState } from '@/features/lyrics/types/lyrics-display-state'

import { karaokeLyricsLeadMs } from '../config/karaoke-timing'
import { KaraokeStage } from './karaoke-stage'

const wordSyncedLyrics: LyricsDisplayState = {
  status: 'synced',
  plainLines: ['Hello world', 'Next line'],
  syncedLines: [
    { startTimeMs: 1_000, text: 'Hello world' },
    { startTimeMs: 3_000, text: 'Next line' }
  ],
  wordSyncedLines: [
    {
      endTimeMs: 3_000,
      startTimeMs: 1_000,
      text: 'Hello world',
      words: [
        { endTimeMs: 2_000, startTimeMs: 1_000, text: 'Hello ' },
        { endTimeMs: 3_000, startTimeMs: 2_000, text: 'world' }
      ]
    },
    {
      endTimeMs: 4_000,
      startTimeMs: 3_000,
      text: 'Next line',
      words: [{ endTimeMs: 4_000, startTimeMs: 3_000, text: 'Next line' }]
    }
  ]
}

describe('KaraokeStage', () => {
  it('fills the active word according to its timestamp', () => {
    const { container } = render(
      <KaraokeStage isPlaying={false} lyrics={wordSyncedLyrics} positionMs={1_500} />
    )

    expect(container.querySelector('[aria-current="true"]')).toHaveTextContent('Hello world')
    expect(container.querySelector('.karaoke-word')?.getAttribute('style')).toContain('50%')
    expect(
      screen.queryByText('Sincronização por palavra indisponível nesta música')
    ).not.toBeInTheDocument()
  })

  it('keeps line synchronization as an explicit fallback', () => {
    render(
      <KaraokeStage
        isPlaying={false}
        lyrics={{ ...wordSyncedLyrics, wordSyncedLines: [] }}
        positionMs={1_500}
      />
    )

    expect(screen.getByText('Hello world')).toHaveAttribute('aria-current', 'true')
    expect(screen.getByText('Sincronização por palavra indisponível nesta música')).toBeVisible()
  })

  it('moves the current and next phrases through the vertical rail', () => {
    const { container, rerender } = render(
      <KaraokeStage isPlaying={false} lyrics={wordSyncedLyrics} positionMs={1_500} />
    )

    const helloLine = container.querySelector('.karaoke-rail-line-active')

    expect(helloLine).toHaveTextContent('Hello world')
    expect(screen.getByText('Next line').closest('p')).toHaveClass('karaoke-rail-line-next')

    rerender(
      <KaraokeStage
        isPlaying={false}
        lyrics={wordSyncedLyrics}
        positionMs={3_000 - karaokeLyricsLeadMs}
      />
    )

    expect(screen.getByText('Next line').closest('p')).toHaveAttribute('aria-current', 'true')
    expect(screen.getByText('Hello world').closest('p')).toHaveClass('karaoke-rail-line-previous')
    expect(screen.getByText('Hello world').closest('p')).toBe(helloLine)
    expect(container.querySelector('.karaoke-line-rail')).toBeInTheDocument()
  })

  it('shows the next phrase using the configured lead time', () => {
    const { container } = render(
      <KaraokeStage
        isPlaying={false}
        lyrics={wordSyncedLyrics}
        positionMs={3_000 - karaokeLyricsLeadMs}
      />
    )

    expect(karaokeLyricsLeadMs).toBe(500)
    expect(screen.getByText('Next line').closest('p')).toHaveAttribute('aria-current', 'true')
    expect(container.querySelector('.karaoke-word')?.getAttribute('style')).toContain('0%')
  })

  it('reserves the same flexible stage area while lyrics are loading', () => {
    const { container, rerender } = render(
      <KaraokeStage
        isPlaying={false}
        lyrics={{ status: 'loading', plainLines: [], syncedLines: [] }}
        positionMs={0}
      />
    )

    expect(container.firstElementChild).toHaveClass('karaoke-stage', 'min-h-0', 'flex-1')

    rerender(<KaraokeStage isPlaying={false} lyrics={wordSyncedLyrics} positionMs={1_500} />)

    expect(container.firstElementChild).toHaveClass('karaoke-stage', 'min-h-0', 'flex-1')
  })
})
