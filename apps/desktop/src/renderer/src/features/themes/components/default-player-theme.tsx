import { Disc3, Pause, Play, SkipBack, SkipForward } from 'lucide-react'

import type { PlayerThemeProps } from '../types/player-theme'

function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function DefaultPlayerTheme({ playback }: PlayerThemeProps): React.JSX.Element {
  const progressPercentage = playback?.durationMs
    ? Math.min(100, (playback.progressMs / playback.durationMs) * 100)
    : 0

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08090a] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(30,215,96,0.16),transparent_34%),radial-gradient(circle_at_78%_75%,rgba(61,90,254,0.12),transparent_36%)]" />

      <div className="relative mx-auto grid min-h-screen max-w-[1500px] grid-cols-[minmax(280px,0.78fr)_minmax(430px,1.22fr)] items-center gap-[clamp(3rem,7vw,8rem)] px-[clamp(3rem,7vw,8rem)] py-12">
        <section className="aspect-square w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] shadow-[0_40px_100px_rgba(0,0,0,0.52)]">
          {playback?.albumImageUrl ? (
            <img
              src={playback.albumImageUrl}
              alt={`Capa do álbum ${playback.albumName}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(145deg,#202622,#0d0f0e)]">
              <Disc3 aria-hidden="true" className="h-1/3 w-1/3 text-white/16" />
              <span className="sr-only">Nenhuma capa de álbum disponível</span>
            </div>
          )}
        </section>

        <section className="flex min-w-0 flex-col">
          <p className="mb-6 text-sm font-semibold tracking-[0.28em] text-[#1ed760] uppercase">
            Music Display
          </p>

          <h1 className="line-clamp-2 text-[clamp(2.75rem,5vw,6.25rem)] leading-[0.96] font-semibold tracking-[-0.055em] text-balance">
            {playback?.trackName ?? 'Nada tocando agora'}
          </h1>

          <p className="mt-6 truncate text-[clamp(1.3rem,2.5vw,2.3rem)] font-medium text-white/55">
            {playback?.artistNames.join(', ') ?? 'Conecte sua conta Spotify para começar'}
          </p>

          <div className="mt-14">
            <div className="h-2 overflow-hidden rounded-full bg-white/12">
              <div
                className="h-full rounded-full bg-white transition-[width] duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="mt-3 flex justify-between text-sm font-medium text-white/38 tabular-nums">
              <span>{formatDuration(playback?.progressMs ?? 0)}</span>
              <span>{formatDuration(playback?.durationMs ?? 0)}</span>
            </div>
          </div>

          <div className="mt-10 flex items-center gap-7">
            <button className="player-control" type="button" aria-label="Faixa anterior" disabled>
              <SkipBack aria-hidden="true" className="h-8 w-8" fill="currentColor" />
            </button>
            <button
              className="player-control player-control-primary"
              type="button"
              aria-label={playback?.isPlaying ? 'Pausar' : 'Reproduzir'}
              disabled
            >
              {playback?.isPlaying ? (
                <Pause aria-hidden="true" className="h-9 w-9" fill="currentColor" />
              ) : (
                <Play aria-hidden="true" className="ml-1 h-9 w-9" fill="currentColor" />
              )}
            </button>
            <button className="player-control" type="button" aria-label="Próxima faixa" disabled>
              <SkipForward aria-hidden="true" className="h-8 w-8" fill="currentColor" />
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
