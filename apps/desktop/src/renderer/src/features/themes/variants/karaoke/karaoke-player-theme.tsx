import { Disc3, Heart, MonitorSpeaker } from 'lucide-react'

import { PlaybackErrorMessage } from '@/features/playback/components/playback-error-message'
import { PlaybackProgressControl } from '@/features/playback/components/playback-progress-control'
import { PlaybackVolumeControl } from '@/features/playback/components/playback-volume-control'
import type { PlayerThemeProps } from '@/features/themes/core/types/player-theme'
import { getPlayerThemeContent } from '@/features/themes/core/utils/get-player-theme-content'

import { KaraokeStage } from './components/karaoke-stage'
import { KaraokeTransportControls } from './components/karaoke-transport-controls'
import './karaoke-player-theme.css'

export function KaraokePlayerTheme({
  chrome,
  controls,
  lyrics,
  playback,
  playbackStatus
}: PlayerThemeProps): React.JSX.Element {
  const content = getPlayerThemeContent(playback, playbackStatus)
  const item = playback?.item ?? null

  return (
    <main className="karaoke-theme relative min-h-screen overflow-hidden bg-[#130d18] text-white">
      {content.imageUrl && (
        <img
          src={content.imageUrl}
          alt=""
          aria-hidden="true"
          className="absolute -inset-20 h-[calc(100%+10rem)] w-[calc(100%+10rem)] scale-110 object-cover opacity-40 blur-[120px] saturate-150"
        />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,8,18,0.7),rgba(15,8,20,0.42)_42%,rgba(9,6,14,0.86))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,213,124,0.08),transparent_38%)]" />

      <div className="fixed top-6 left-6 z-30">{chrome.connectionStatus}</div>
      <nav
        className="fixed top-6 right-6 z-30 flex items-start gap-2"
        aria-label="Ações do display"
      >
        {chrome.themeSelector}
        {chrome.accountMenu}
        {chrome.fullscreenControl}
      </nav>

      <section className="karaoke-layout relative z-10 mx-auto flex min-h-screen w-full max-w-[1800px] flex-col px-[clamp(2rem,6vw,7rem)] pt-24 pb-7">
        <header className="karaoke-track-summary mx-auto flex max-w-3xl items-center justify-center gap-5 text-left">
          <div className="aspect-square w-[clamp(4.5rem,8vw,7rem)] shrink-0 overflow-hidden rounded-2xl border border-white/12 bg-white/[0.06] shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
            {content.imageUrl ? (
              <img
                src={content.imageUrl}
                alt={`Capa de ${content.collectionName}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Disc3 aria-hidden="true" className="h-1/3 w-1/3 text-white/20" />
                <span className="sr-only">Nenhuma capa de álbum disponível</span>
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h1 className="truncate pb-1 text-[clamp(1.7rem,3vw,3.25rem)] leading-none font-bold tracking-[-0.045em]">
              {content.title}
            </h1>
            <p className="mt-2 truncate text-[clamp(1rem,1.5vw,1.3rem)] font-semibold text-white/58">
              {content.creatorNames}
            </p>
            {content.collectionName && (
              <p className="mt-1 truncate text-sm font-medium text-white/32">
                {content.collectionName}
              </p>
            )}
          </div>
        </header>

        <KaraokeStage
          isPlaying={playback?.isPlaying ?? false}
          lyrics={lyrics}
          positionMs={playback?.progressMs ?? 0}
        />

        <div className="karaoke-player-footer mx-auto w-full max-w-4xl">
          <PlaybackProgressControl
            accentColor="#ffd77d"
            canSeek={Boolean(item && playback?.capabilities.canSeek)}
            durationMs={item?.durationMs ?? 0}
            isPending={controls.isSeekPending}
            onSeek={controls.onSeek}
            positionMs={playback?.progressMs ?? 0}
            timeClassName="mt-2 flex justify-between text-xs font-semibold text-white/36 tabular-nums"
            trackColor="rgba(255,255,255,0.16)"
          />

          <div className="relative mt-3">
            <KaraokeTransportControls controls={controls} playback={playback} />
            <button
              className={`absolute top-1/2 right-0 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#ffd77d] disabled:cursor-not-allowed disabled:opacity-30 ${controls.isSaved ? 'bg-[#ffd77d]/14 text-[#ffd77d]' : 'text-white/46 hover:bg-white/[0.08] hover:text-white'}`}
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
            <div className="mt-3 flex items-center justify-center gap-5 text-xs font-semibold text-white/36">
              <span className="inline-flex max-w-48 items-center gap-2 truncate">
                <MonitorSpeaker aria-hidden="true" className="h-3.5 w-3.5" />
                {playback.device.name}
              </span>
              <PlaybackVolumeControl
                accentColor="#ffd77d"
                buttonClassName="text-[#ffd77d]"
                canSetVolume={playback.capabilities.canSetVolume}
                isPending={controls.isVolumePending}
                onCommitVolume={controls.onCommitVolume}
                onSetVolume={controls.onSetVolume}
                onToggleMute={controls.onToggleMute}
                percentageClassName="sr-only"
                rangeClassName="w-24"
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
        </div>
      </section>
    </main>
  )
}
