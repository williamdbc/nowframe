import { useMemo } from 'react'

import { useLyricsPlaybackPosition } from '@/features/lyrics/hooks/useLyricsPlaybackPosition'
import type {
  LyricsDisplayState,
  WordSyncedLyricsLine
} from '@/features/lyrics/types/lyrics-display-state'
import { getActiveLyricsLineIndex } from '@/features/lyrics/utils/get-active-lyrics-line-index'

import { getKaraokeWordFill } from '../utils/get-karaoke-word-fill'

interface KaraokeStageProps {
  isPlaying: boolean
  lyrics: LyricsDisplayState
  positionMs: number
}

function KaraokeMessage({ children }: React.PropsWithChildren): React.JSX.Element {
  return (
    <div className="flex min-h-72 items-center justify-center px-8 text-center">
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
          backgroundImage: `linear-gradient(90deg, #fff3c7 0%, #fff3c7 ${fill}%, rgba(255,255,255,0.24) ${fill}%, rgba(255,255,255,0.24) 100%)`,
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
  const lyricsPositionMs = useLyricsPlaybackPosition(positionMs, isPlaying)
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
  const matchedLineIndex = getActiveLyricsLineIndex(stageLines, lyricsPositionMs)
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

  const previousLine = stageLines[activeLineIndex - 1] ?? null
  const activeLine = stageLines[activeLineIndex]
  const nextLine = stageLines[activeLineIndex + 1] ?? null

  return (
    <div className="karaoke-stage relative min-h-0 flex-1 overflow-hidden text-center">
      <div
        key={`${activeLine.startTimeMs}-${activeLineIndex}`}
        className="karaoke-phrase-group absolute inset-0 px-[clamp(1rem,5vw,6rem)]"
        aria-label="Letra do karaokê"
      >
        <p className="karaoke-context-line karaoke-context-previous" aria-hidden="true">
          {previousLine?.text ?? ''}
        </p>

        <p className="karaoke-active-line" aria-current="true">
          {hasWordSynchronization
            ? renderWordSyncedLine(activeLine, nextLine?.startTimeMs ?? null, lyricsPositionMs)
            : activeLine.text}
        </p>

        <p className="karaoke-context-line karaoke-context-next" aria-hidden="true">
          {nextLine?.text ?? ''}
        </p>
      </div>

      {!hasWordSynchronization && (
        <p className="pointer-events-none absolute right-0 bottom-2 left-0 text-xs font-semibold tracking-[0.12em] text-white/24 uppercase">
          Sincronização por palavra indisponível nesta música
        </p>
      )}
    </div>
  )
}
