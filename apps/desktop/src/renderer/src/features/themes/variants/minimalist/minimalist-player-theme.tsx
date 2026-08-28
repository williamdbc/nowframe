import { Disc3, Heart } from 'lucide-react'

import { PlaybackProgressControl } from '@/features/playback/components/playback-progress-control'
import { PlaybackErrorMessage } from '@/features/playback/components/playback-error-message'
import { PlaybackVolumeControl } from '@/features/playback/components/playback-volume-control'
import type { PlayerThemeProps } from '@/features/themes/core/types/player-theme'
import { getPlayerThemeContent } from '@/features/themes/core/utils/get-player-theme-content'
import { FullscreenExitControl } from '@/features/window-controls/components/fullscreen-exit-control'

import { MinimalistTransportControls } from './components/minimalist-transport-controls'
import './minimalist-player-theme.css'

export function MinimalistPlayerTheme({
  chrome,
  controls,
  isFullScreen,
  onExitFullScreen,
  playback,
  playbackStatus
}: PlayerThemeProps): React.JSX.Element {
  const content = getPlayerThemeContent(playback, playbackStatus)
  const item = playback?.item ?? null

  return (
    <main className="player-theme-root relative min-h-screen overflow-hidden bg-[#111] text-white">
      {content.imageUrl && (
        <img
          src={content.imageUrl}
          alt=""
          aria-hidden="true"
          className="absolute -inset-12 h-[calc(100%+6rem)] w-[calc(100%+6rem)] scale-110 object-cover opacity-35 blur-[90px] saturate-75"
        />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(8,8,8,0.5),rgba(8,8,8,0.82))]" />

      <div className="player-theme-chrome fixed top-6 left-6 z-20">{chrome.connectionStatus}</div>
      <nav
        className="player-theme-chrome fixed top-6 right-6 z-20 flex items-start gap-2"
        aria-label="Ações do display"
      >
        {chrome.themeSelector}
        {chrome.accountMenu}
        {isFullScreen ? (
          <FullscreenExitControl onExitFullScreen={onExitFullScreen} />
        ) : (
          chrome.fullscreenControl
        )}
      </nav>

      <section className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-10 py-10 text-center">
        <div className="aspect-square w-[clamp(10rem,28vh,16rem)] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] shadow-[0_32px_90px_rgba(0,0,0,0.48)]">
          {content.imageUrl ? (
            <img
              src={content.imageUrl}
              alt={`Capa de ${content.collectionName}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-white/[0.04]">
              <Disc3 aria-hidden="true" className="h-1/3 w-1/3 text-white/12" />
              <span className="sr-only">Nenhuma capa de álbum disponível</span>
            </div>
          )}
        </div>

        <div className="mt-8 flex max-w-2xl items-start justify-center gap-3">
          <h1 className="line-clamp-2 min-w-0 pb-1 text-[clamp(2rem,4.2vw,4.4rem)] leading-[1.02] font-medium tracking-[-0.045em] text-balance">
            {content.title}
          </h1>
        </div>
        <p className="mt-3 max-w-xl truncate text-[clamp(1rem,1.8vw,1.45rem)] font-medium text-white/52">
          {content.creatorNames}
        </p>
        {content.collectionName && (
          <p className="mt-1 max-w-xl truncate text-sm text-white/28">{content.collectionName}</p>
        )}

        <PlaybackProgressControl
          accentColor="rgba(255,255,255,0.9)"
          canSeek={Boolean(item && playback?.capabilities.canSeek)}
          className="mt-8 w-full max-w-xl"
          durationMs={item?.durationMs ?? 0}
          isPending={controls.isSeekPending}
          onSeek={controls.onSeek}
          positionMs={playback?.progressMs ?? 0}
          rangeClassName="minimalist-player-range"
          timeClassName="mt-2 flex justify-between text-xs font-medium text-white/30 tabular-nums"
          trackColor="rgba(255,255,255,0.14)"
        />

        <div className="relative mt-7 w-full max-w-xl">
          <MinimalistTransportControls controls={controls} playback={playback} />
          <button
            className={`absolute top-1 right-0 flex h-10 w-10 items-center justify-center rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-25 ${controls.isSaved ? 'bg-white/12 text-white' : 'text-white/36 hover:bg-white/[0.07] hover:text-white/70'}`}
            type="button"
            aria-label={controls.isSaved ? 'Remover da biblioteca' : 'Adicionar à biblioteca'}
            aria-pressed={controls.isSaved}
            disabled={!item || !controls.canToggleSaved || controls.isLibraryPending}
            onClick={controls.onToggleSaved}
          >
            <Heart
              aria-hidden="true"
              className="h-5 w-5"
              fill={controls.isSaved ? 'currentColor' : 'none'}
            />
          </button>
        </div>

        {playback && (
          <div className="mt-6 flex items-center gap-4 text-white/38">
            <span className="max-w-48 truncate text-xs">{playback.device.name}</span>
            <PlaybackVolumeControl
              canSetVolume={playback.capabilities.canSetVolume}
              isPending={controls.isVolumePending}
              onCommitVolume={controls.onCommitVolume}
              onSetVolume={controls.onSetVolume}
              onToggleMute={controls.onToggleMute}
              percentageClassName="sr-only"
              rangeClassName="minimalist-player-range w-24"
              volumePercent={playback.device.volumePercent}
            />
          </div>
        )}

        {controls.errorMessage && (
          <PlaybackErrorMessage
            key={controls.errorMessage}
            className="mt-5 text-sm font-medium text-red-200"
            message={controls.errorMessage}
          />
        )}
      </section>
    </main>
  )
}
