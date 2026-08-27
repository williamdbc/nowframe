import { useMemo } from 'react'

import { useLyricsPlaybackPosition } from '@/features/lyrics/hooks/useLyricsPlaybackPosition'
import type {
  LyricsDisplayState,
  WordSyncedLyricsLine
} from '@/features/lyrics/types/lyrics-display-state'
import { getActiveLyricsLineIndex } from '@/features/lyrics/utils/get-active-lyrics-line-index'

import { karaokeLyricsLeadMs } from '../config/karaoke-timing'
import { getKaraokeWordFill } from '../utils/get-karaoke-word-fill'

interface KaraokeStageProps {
  isPlaying: boolean
  lyrics: LyricsDisplayState
  positionMs: number
}

function KaraokeMessage({ children }: React.PropsWithChildren): React.JSX.Element {
  return (
    <div className="karaoke-stage relative flex min-h-0 flex-1 items-center justify-center px-8 text-center">
      <p className="max-w-2xl text-[clamp(1.7rem,3.4vw,3.5rem)] leading-tight font-bold tracking-[-0.04em] text-white/42">
        {children}
      </p>
    </div>
  )
}

function renderWordSyncedLine(
  line: WordSyncedLyricsLine,
  nextLineStartTimeMs: number | null,
  positionMs: number
): React.ReactNode {
  if (line.words.length === 0) return line.text

  return line.words.map((word, wordIndex) => {
    const fill = getKaraokeWordFill(line, wordIndex, nextLineStartTimeMs, positionMs)

    return (
      <span
        key={`${word.startTimeMs}-${wordIndex}`}
        className="karaoke-word"
        style={{
          backgroundImage: `linear-gradient(90deg, #fff3c7 0%, #fff3c7 ${fill}%, rgba(255,255,255,0.34) ${fill}%, rgba(255,255,255,0.34) 100%)`,
          backgroundClip: 'text',
          color: 'transparent',
          WebkitBackgroundClip: 'text'
        }}
      >
        {word.text}
      </span>
    )
  })
}

export function KaraokeStage({
  isPlaying,
  lyrics,
  positionMs
}: KaraokeStageProps): React.JSX.Element {
  const playbackPositionMs = useLyricsPlaybackPosition(positionMs, isPlaying)
  const phrasePositionMs = playbackPositionMs + karaokeLyricsLeadMs
  const hasWordSynchronization =
    lyrics.status === 'synced' && lyrics.wordSyncedLines.some((line) => line.words.length > 0)
  const stageLines = useMemo<readonly WordSyncedLyricsLine[]>(() => {
    if (lyrics.status !== 'synced') return []
    if (hasWordSynchronization) return lyrics.wordSyncedLines

    return lyrics.syncedLines.map((line) => ({
      endTimeMs: null,
      startTimeMs: line.startTimeMs,
      text: line.text,
      words: []
    }))
  }, [hasWordSynchronization, lyrics])
  const matchedLineIndex = getActiveLyricsLineIndex(stageLines, phrasePositionMs)
  const activeLineIndex = stageLines.length === 0 ? -1 : Math.max(0, matchedLineIndex)

  if (lyrics.status === 'idle') {
    return <KaraokeMessage>Reproduza uma música para começar o karaokê.</KaraokeMessage>
  }
  if (lyrics.status === 'loading') {
    return <KaraokeMessage>Preparando o karaokê...</KaraokeMessage>
  }
  if (lyrics.status === 'error') return <KaraokeMessage>{lyrics.errorMessage}</KaraokeMessage>
  if (lyrics.status === 'not-found') {
    return <KaraokeMessage>Não encontramos a letra desta versão da música.</KaraokeMessage>
  }
  if (lyrics.status === 'instrumental') {
    return <KaraokeMessage>Esta faixa é instrumental.</KaraokeMessage>
  }
  if (lyrics.status === 'plain') {
    return <KaraokeMessage>Esta música ainda não possui letra sincronizada.</KaraokeMessage>
  }

  const firstVisibleLineIndex = Math.max(0, activeLineIndex - 2)
  const visibleLines = stageLines.slice(
    firstVisibleLineIndex,
    Math.min(stageLines.length, activeLineIndex + 3)
  )

  return (
    <div className="karaoke-stage relative min-h-0 flex-1 overflow-hidden text-center">
      <div className="karaoke-line-rail absolute inset-0" aria-label="Letra do karaokê">
        {visibleLines.map((line, visibleLineIndex) => {
          const lineIndex = firstVisibleLineIndex + visibleLineIndex
          const distanceFromActive = lineIndex - activeLineIndex
          const positionClass =
            distanceFromActive === 0
              ? 'karaoke-rail-line-active'
              : distanceFromActive === -1
                ? 'karaoke-rail-line-previous'
                : distanceFromActive === 1
                  ? 'karaoke-rail-line-next'
                  : distanceFromActive < 0
                    ? 'karaoke-rail-line-far-previous'
                    : 'karaoke-rail-line-far-next'
          const isActive = distanceFromActive === 0

          return (
            <p
              key={`${line.startTimeMs}-${line.text}`}
              className={`karaoke-rail-line ${positionClass}`}
              aria-current={isActive ? 'true' : undefined}
              aria-hidden={isActive ? undefined : 'true'}
            >
              {isActive && hasWordSynchronization
                ? renderWordSyncedLine(
                    line,
                    stageLines[lineIndex + 1]?.startTimeMs ?? null,
                    playbackPositionMs
                  )
                : line.text}
            </p>
          )
        })}
      </div>

      {!hasWordSynchronization && (
        <p className="pointer-events-none absolute right-0 bottom-2 left-0 text-xs font-semibold tracking-[0.12em] text-white/24 uppercase">
          Sincronização por palavra indisponível nesta música
        </p>
      )}
    </div>
  )
}
