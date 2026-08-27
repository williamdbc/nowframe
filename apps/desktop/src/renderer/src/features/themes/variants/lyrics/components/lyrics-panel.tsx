import { useEffect, useMemo, useRef } from 'react'

import { useLyricsPlaybackPosition } from '@/features/lyrics/hooks/useLyricsPlaybackPosition'
import type { LyricsDisplayState } from '@/features/lyrics/types/lyrics-display-state'
import { getActiveLyricsLineIndex } from '@/features/lyrics/utils/get-active-lyrics-line-index'

import { showUnsynchronizedLyrics } from '../config/lyrics-theme-options'

interface LyricsPanelProps {
  isPlaying: boolean
  lyrics: LyricsDisplayState
  positionMs: number
}

function LyricsMessage({ children }: React.PropsWithChildren): React.JSX.Element {
  return (
    <div className="flex h-full min-h-72 items-center justify-center px-8 text-center">
      <p className="max-w-md text-[clamp(1.35rem,2.4vw,2.1rem)] leading-tight font-semibold tracking-[-0.025em] text-white/42">
        {children}
      </p>
    </div>
  )
}

export function LyricsPanel({
  isPlaying,
  lyrics,
  positionMs
}: LyricsPanelProps): React.JSX.Element {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const lineRefs = useRef<Array<HTMLParagraphElement | null>>([])
  const lyricsPositionMs = useLyricsPlaybackPosition(positionMs, isPlaying)
  const activeLineIndex = useMemo(
    () =>
      lyrics.status === 'synced'
        ? getActiveLyricsLineIndex(lyrics.syncedLines, lyricsPositionMs)
        : -1,
    [lyrics, lyricsPositionMs]
  )

  useEffect(() => {
    if (activeLineIndex < 0) return

    const container = scrollContainerRef.current
    const activeLine = lineRefs.current[activeLineIndex]
    if (!container || !activeLine) return

    const targetTop =
      activeLine.offsetTop - container.clientHeight / 2 + activeLine.clientHeight / 2
    container.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' })
  }, [activeLineIndex])

  if (lyrics.status === 'idle') {
    return <LyricsMessage>Reproduza uma música para acompanhar a letra.</LyricsMessage>
  }

  if (lyrics.status === 'loading') {
    return (
      <div
        className="flex h-full min-h-72 flex-col justify-center gap-5 px-8"
        aria-label="Carregando letra"
      >
        {[72, 88, 64, 82].map((width) => (
          <span
            key={width}
            className="lyrics-skeleton h-9 rounded-xl bg-white/[0.08]"
            style={{ width: `${width}%` }}
          />
        ))}
      </div>
    )
  }

  if (lyrics.status === 'error') return <LyricsMessage>{lyrics.errorMessage}</LyricsMessage>
  if (lyrics.status === 'not-found') {
    return <LyricsMessage>Não encontramos a letra desta versão da música.</LyricsMessage>
  }
  if (lyrics.status === 'instrumental') {
    return <LyricsMessage>Esta faixa é instrumental.</LyricsMessage>
  }

  if (lyrics.status === 'plain') {
    if (!showUnsynchronizedLyrics) {
      return <LyricsMessage>Esta música não possui letra sincronizada.</LyricsMessage>
    }

    return (
      <div
        className="lyrics-scroll h-full overflow-y-auto px-8 py-[42vh]"
        aria-label="Letra da música"
      >
        {lyrics.plainLines.map((line, index) => (
          <p
            key={`${line}-${index}`}
            className="mb-5 text-[clamp(1.4rem,2.6vw,2.6rem)] leading-[1.15] font-semibold tracking-[-0.03em] text-white/66"
          >
            {line}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div
      ref={scrollContainerRef}
      className="lyrics-scroll h-full overflow-y-auto px-8 py-[42vh]"
      aria-label="Letra sincronizada da música"
    >
      {lyrics.syncedLines.map((line, index) => {
        const distance = activeLineIndex < 0 ? index + 1 : Math.abs(index - activeLineIndex)
        const isActive = index === activeLineIndex

        return (
          <p
            key={`${line.startTimeMs}-${line.text}`}
            ref={(element) => {
              lineRefs.current[index] = element
            }}
            className={`lyrics-line mb-5 text-[clamp(1.55rem,3vw,3.35rem)] leading-[1.08] font-semibold tracking-[-0.04em] ${isActive ? 'lyrics-line-active text-white' : distance === 1 ? 'text-white/40' : 'text-white/18'}`}
            aria-current={isActive ? 'true' : undefined}
          >
            {line.text}
          </p>
        )
      })}
    </div>
  )
}
