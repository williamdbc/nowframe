import { Disc3, Heart, MonitorSpeaker } from 'lucide-react'

import { PlaybackErrorMessage } from '@/features/playback/components/playback-error-message'
import { PlaybackProgressControl } from '@/features/playback/components/playback-progress-control'
import { PlaybackVolumeControl } from '@/features/playback/components/playback-volume-control'
import type { PlayerThemeProps } from '@/features/themes/core/types/player-theme'
import { getPlayerThemeContent } from '@/features/themes/core/utils/get-player-theme-content'
import { FullscreenExitControl } from '@/features/window-controls/components/fullscreen-exit-control'

import { LyricsPanel } from './components/lyrics-panel'
import { LyricsTransportControls } from './components/lyrics-transport-controls'
import './lyrics-player-theme.css'

export function LyricsPlayerTheme({
  chrome,
  controls,
  isFullScreen,
  lyrics,
  onExitFullScreen,
  playback,
  playbackStatus
}: PlayerThemeProps): React.JSX.Element {
  const content = getPlayerThemeContent(playback, playbackStatus)
  const item = playback?.item ?? null

  return (
    <main className="player-theme-root lyrics-theme relative min-h-screen overflow-hidden bg-[#12100f] text-white">
      {content.imageUrl && (
        <img
          src={content.imageUrl}
          alt=""
          aria-hidden="true"
          className="absolute -inset-16 h-[calc(100%+8rem)] w-[calc(100%+8rem)] scale-110 object-cover opacity-28 blur-[110px] saturate-125"
        />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(10,8,8,0.76),rgba(14,11,10,0.52)_45%,rgba(8,7,7,0.72))]" />
      <div className="absolute inset-0 bg-black/15" />

      <div className="player-theme-chrome fixed top-6 left-6 z-30">{chrome.connectionStatus}</div>
      <nav
        className="player-theme-chrome fixed top-6 right-6 z-30 flex items-start gap-2"
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

      <div className="lyrics-layout relative z-10 mx-auto grid min-h-screen max-w-[1800px] grid-cols-[minmax(280px,0.72fr)_minmax(440px,1.28fr)] gap-[clamp(2.5rem,6vw,7rem)] px-[clamp(2rem,5vw,6rem)] pt-24 pb-10">
        <section className="lyrics-player-panel flex min-w-0 flex-col justify-center">
          <div className="lyrics-cover aspect-square w-full max-w-[clamp(14rem,28vw,24rem)] self-center overflow-hidden rounded-[2rem] border border-white/12 bg-white/[0.06] shadow-[0_30px_90px_rgba(0,0,0,0.46)]">
            {content.imageUrl ? (
              <img
                src={content.imageUrl}
                alt={`Capa de ${content.collectionName}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-white/[0.04]">
                <Disc3 aria-hidden="true" className="h-1/3 w-1/3 text-white/20" />
                <span className="sr-only">Nenhuma capa de álbum disponível</span>
              </div>
            )}
          </div>

          <div className="mt-6 min-w-0 text-center">
            <h1 className="truncate pb-1 text-[clamp(1.7rem,3vw,3rem)] leading-none font-semibold tracking-[-0.045em]">
              {content.title}
            </h1>
            <p className="mt-2 truncate text-[clamp(1rem,1.5vw,1.3rem)] font-medium text-white/58">
              {content.creatorNames}
            </p>
            {content.collectionName && (
              <p className="mt-1 truncate text-sm text-white/34">{content.collectionName}</p>
            )}
          </div>

          <PlaybackProgressControl
            accentColor="#f3b5a3"
            canSeek={Boolean(item && playback?.capabilities.canSeek)}
            className="mt-6"
            durationMs={item?.durationMs ?? 0}
            isPending={controls.isSeekPending}
            onSeek={controls.onSeek}
            positionMs={playback?.progressMs ?? 0}
            timeClassName="mt-2 flex justify-between text-xs font-medium text-white/38 tabular-nums"
            trackColor="rgba(255,255,255,0.16)"
          />

          <div className="relative mt-4">
            <LyricsTransportControls controls={controls} playback={playback} />
            <button
              className={`absolute top-1/2 right-0 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#f3b5a3] disabled:cursor-not-allowed disabled:opacity-30 ${controls.isSaved ? 'bg-[#f3b5a3]/14 text-[#f3b5a3]' : 'text-white/46 hover:bg-white/[0.08] hover:text-white'}`}
              type="button"
              aria-label={controls.isSaved ? 'Remover da biblioteca' : 'Adicionar à biblioteca'}
              aria-pressed={controls.isSaved}
              disabled={!item || !controls.canToggleSaved || controls.isLibraryPending}
              onClick={controls.onToggleSaved}
            >
              <Heart
                aria-hidden="true"
                className="h-4.5 w-4.5"
                fill={controls.isSaved ? 'currentColor' : 'none'}
              />
            </button>
          </div>

          {playback && (
            <div className="mt-4 flex items-center justify-center gap-4 text-xs font-medium text-white/38">
              <span className="inline-flex max-w-44 items-center gap-2 truncate">
                <MonitorSpeaker aria-hidden="true" className="h-3.5 w-3.5" />
                {playback.device.name}
              </span>
              <PlaybackVolumeControl
                accentColor="#f3b5a3"
                buttonClassName="text-[#f3b5a3]"
                canSetVolume={playback.capabilities.canSetVolume}
                isPending={controls.isVolumePending}
                onCommitVolume={controls.onCommitVolume}
                onSetVolume={controls.onSetVolume}
                onToggleMute={controls.onToggleMute}
                percentageClassName="sr-only"
                rangeClassName="w-20"
                volumePercent={playback.device.volumePercent}
              />
            </div>
          )}

          {controls.errorMessage && (
            <PlaybackErrorMessage
              key={controls.errorMessage}
              className="mt-3 text-center text-sm font-medium text-red-200"
              message={controls.errorMessage}
            />
          )}
        </section>

        <section className="lyrics-panel-container min-h-0 overflow-hidden rounded-[2rem] border border-white/[0.07] bg-black/12 shadow-[inset_0_1px_rgba(255,255,255,0.04)]">
          <LyricsPanel
            isPlaying={playback?.isPlaying ?? false}
            lyrics={lyrics}
            positionMs={playback?.progressMs ?? 0}
          />
        </section>
      </div>
    </main>
  )
}
