import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { useLyricsPlaybackPosition } from '@/features/lyrics/hooks/useLyricsPlaybackPosition'
import type { LyricsDisplayState } from '@/features/lyrics/types/lyrics-display-state'
import { getActiveLyricsLineIndex } from '@/features/lyrics/utils/get-active-lyrics-line-index'

interface AmbientLyricsPanelProps {
  isPlaying: boolean
  lyrics: LyricsDisplayState
  positionMs: number
}

/**
 * A entrada é escalonada por linha, mas uma letra inteira acumularia dezenas de
 * segundos de atraso. Só a primeira dobra entra escalonada.
 */
const maximumStaggeredLine = 6
const staggerMs = 90

function getRevealDelayMs(index: number): string {
  return `${Math.min(index, maximumStaggeredLine) * staggerMs}ms`
}

/**
 * No Figma a linha atual fica no topo do palco em opacidade cheia, a seguinte a
 * 40% e todo o resto a 10% — o passado sai por cima do recorte.
 */
function getLineState(index: number, activeLineIndex: number): 'active' | 'next' | 'rest' {
  if (index === activeLineIndex) return 'active'
  if (index === activeLineIndex + 1) return 'next'
  return 'rest'
}

function AmbientLyricsMessage({ children }: React.PropsWithChildren): React.JSX.Element {
  return (
    <div className="ambient-lyrics-stage flex items-start">
      <p className="ambient-lyrics-message">{children}</p>
    </div>
  )
}

function AmbientLyricsText({
  delayMs,
  text
}: {
  delayMs: string
  text: string
}): React.JSX.Element {
  // O texto sobe de trás de um recorte: é isso que dá o caráter "mask" do spec.
  return (
    <span className="ambient-lyrics-mask">
      <span className="ambient-lyrics-reveal" style={{ animationDelay: delayMs }}>
        {text}
      </span>
    </span>
  )
}

export function AmbientLyricsPanel({
  isPlaying,
  lyrics,
  positionMs
}: AmbientLyricsPanelProps): React.JSX.Element {
  const lineRefs = useRef<Array<HTMLParagraphElement | null>>([])
  const [activeLineOffsetTop, setActiveLineOffsetTop] = useState(0)
  const lyricsPositionMs = useLyricsPlaybackPosition(positionMs, isPlaying)
  const activeLineIndex = useMemo(
    () =>
      lyrics.status === 'synced'
        ? getActiveLyricsLineIndex(lyrics.syncedLines, lyricsPositionMs)
        : -1,
    [lyrics, lyricsPositionMs]
  )

  // Antes do primeiro verso o palco fica na primeira linha, e não deslocado.
  const anchoredLineIndex = Math.max(activeLineIndex, 0)

  useLayoutEffect(() => {
    setActiveLineOffsetTop(lineRefs.current[anchoredLineIndex]?.offsetTop ?? 0)
  }, [anchoredLineIndex, lyrics])

  // As linhas quebram em mais ou menos alturas conforme a janela muda de
  // largura, então o deslocamento precisa ser remedido junto.
  useEffect(() => {
    const syncOffset = (): void => {
      setActiveLineOffsetTop(lineRefs.current[anchoredLineIndex]?.offsetTop ?? 0)
    }

    window.addEventListener('resize', syncOffset)
    return () => window.removeEventListener('resize', syncOffset)
  }, [anchoredLineIndex])

  if (lyrics.status === 'idle') {
    return (
      <AmbientLyricsMessage>Reproduza uma música para acompanhar a letra.</AmbientLyricsMessage>
    )
  }

  if (lyrics.status === 'loading') {
    return (
      <div className="ambient-lyrics-stage flex flex-col gap-[16px]" aria-label="Carregando letra">
        {[72, 88, 64, 82].map((width) => (
          <span
            key={width}
            className="ambient-lyrics-skeleton h-[var(--ambient-lyrics-size)] rounded-[4px] bg-white/[0.08]"
            style={{ width: `${width}%` }}
          />
        ))}
      </div>
    )
  }

  if (lyrics.status === 'error') {
    return <AmbientLyricsMessage>{lyrics.errorMessage}</AmbientLyricsMessage>
  }
  if (lyrics.status === 'not-found') {
    return (
      <AmbientLyricsMessage>Não encontramos a letra desta versão da música.</AmbientLyricsMessage>
    )
  }
  if (lyrics.status === 'instrumental') {
    return <AmbientLyricsMessage>Esta faixa é instrumental.</AmbientLyricsMessage>
  }

  // Sem marcação de tempo não há linha atual para ancorar no topo, então a letra
  // vira uma lista rolável no mesmo palco.
  if (lyrics.status === 'plain') {
    return (
      <div
        className="ambient-lyrics-stage ambient-lyrics-stage--scroll"
        aria-label="Letra da música"
      >
        <div className="ambient-lyrics-track">
          {lyrics.plainLines.map((line, index) => (
            <p key={`${line}-${index}`} className="ambient-lyrics-line" data-state="active">
              <AmbientLyricsText delayMs={getRevealDelayMs(index)} text={line} />
            </p>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="ambient-lyrics-stage" aria-label="Letra sincronizada da música">
      <div
        className="ambient-lyrics-track"
        style={{ transform: `translateY(-${activeLineOffsetTop}px)` }}
      >
        {lyrics.syncedLines.map((line, index) => (
          <p
            key={`${line.startTimeMs}-${line.text}`}
            ref={(element) => {
              lineRefs.current[index] = element
            }}
            className="ambient-lyrics-line"
            data-state={getLineState(index, activeLineIndex)}
            aria-current={index === activeLineIndex ? 'true' : undefined}
          >
            <AmbientLyricsText delayMs={getRevealDelayMs(index)} text={line.text} />
          </p>
        ))}
      </div>
    </div>
  )
}
