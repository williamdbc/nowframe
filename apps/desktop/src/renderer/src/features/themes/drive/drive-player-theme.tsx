import { Disc3, Heart, MonitorSpeaker } from 'lucide-react'

import { PlaybackProgressControl } from '@/features/playback/components/playback-progress-control'
import { PlaybackErrorMessage } from '@/features/playback/components/playback-error-message'
import { PlaybackVolumeControl } from '@/features/playback/components/playback-volume-control'
import type { PlayerThemeProps } from '@/features/themes/types/player-theme'
import { getPlayerThemeContent } from '@/features/themes/utils/get-player-theme-content'

import { DriveTransportControls } from './components/drive-transport-controls'

export function DrivePlayerTheme({
  chrome,
  controls,
  playback,
  playbackStatus
}: PlayerThemeProps): React.JSX.Element {
  const content = getPlayerThemeContent(playback, playbackStatus)
  const item = playback?.item ?? null

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#090d10] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#151d22_0%,#090d10_52%,#11171b_100%)]" />
      <div className="absolute top-0 right-0 h-[38rem] w-[38rem] rounded-full bg-[#66e4ff]/8 blur-[140px]" />

      <div className="fixed top-6 left-6 z-20">{chrome.connectionStatus}</div>
      <nav
        className="fixed top-6 right-6 z-20 flex items-start gap-2"
        aria-label="Ações do display"
      >
        {chrome.themeSelector}
        {chrome.accountMenu}
        {chrome.fullscreenControl}
      </nav>

      <div className="relative mx-auto grid min-h-screen max-w-[1680px] grid-cols-[minmax(280px,0.85fr)_minmax(400px,1.15fr)] items-center gap-[clamp(2rem,4vw,6rem)] px-[clamp(2rem,4vw,7rem)] pt-24 pb-12 max-[1100px]:pt-20 max-[1100px]:pb-2 max-[800px]:grid-cols-1 max-[800px]:py-32">
        <section>
          <div className="aspect-square overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#151c20] shadow-[0_35px_100px_rgba(0,0,0,0.55)]">
            {content.imageUrl ? (
              <img
                src={content.imageUrl}
                alt={`Capa de ${content.collectionName}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(145deg,#26343b,#11171b)]">
                <Disc3 aria-hidden="true" className="h-1/3 w-1/3 text-[#66e4ff]/18" />
                <span className="sr-only">Nenhuma capa de álbum disponível</span>
              </div>
            )}
          </div>
        </section>

        <section className="min-w-0">
          <div className="flex items-start gap-4">
            <h1 className="line-clamp-2 min-w-0 flex-1 pb-1 text-[clamp(3rem,5.2vw,6.5rem)] leading-[0.98] font-bold tracking-[-0.055em] text-balance">
              {content.title}
            </h1>
            <button
              className={`mt-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border transition focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#66e4ff] disabled:cursor-not-allowed disabled:opacity-30 ${controls.isSaved ? 'border-[#66e4ff]/45 bg-[#66e4ff]/14 text-[#66e4ff]' : 'border-white/10 bg-white/[0.06] text-white/54 hover:bg-white/[0.1] hover:text-white'}`}
              type="button"
              aria-label={controls.isSaved ? 'Remover da biblioteca' : 'Adicionar à biblioteca'}
              aria-pressed={controls.isSaved}
              disabled={!item || !controls.canToggleSaved || controls.isLibraryPending}
              onClick={controls.onToggleSaved}
            >
              <Heart
                aria-hidden="true"
                className="h-6 w-6"
                fill={controls.isSaved ? 'currentColor' : 'none'}
              />
            </button>
          </div>
          <p className="mt-5 truncate text-[clamp(1.45rem,2.6vw,2.7rem)] font-semibold text-white/58">
            {content.creatorNames}
          </p>
          {content.collectionName && (
            <p className="mt-2 truncate text-lg font-medium text-white/30">
              {content.collectionName}
            </p>
          )}

          {playback && (
            <div className="mt-7 flex flex-wrap items-center gap-5 rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-3 text-sm font-semibold text-white/48">
              <span className="inline-flex items-center gap-2">
                <MonitorSpeaker aria-hidden="true" className="h-4 w-4 text-[#66e4ff]" />
                {playback.device.name}
              </span>
              <PlaybackVolumeControl
                accentColor="#66e4ff"
                buttonClassName="text-[#66e4ff]"
                canSetVolume={playback.capabilities.canSetVolume}
                isPending={controls.isVolumePending}
                onCommitVolume={controls.onCommitVolume}
                onSetVolume={controls.onSetVolume}
                onToggleMute={controls.onToggleMute}
                percentageClassName="w-10 text-right text-sm font-bold tabular-nums text-white/60"
                rangeClassName="drive-player-range"
                trackColor="rgba(255,255,255,0.1)"
                volumePercent={playback.device.volumePercent}
              />
            </div>
          )}

          <PlaybackProgressControl
            accentColor="#66e4ff"
            canSeek={Boolean(item && playback?.capabilities.canSeek)}
            className="mt-9"
            durationMs={item?.durationMs ?? 0}
            isPending={controls.isSeekPending}
            onSeek={controls.onSeek}
            positionMs={playback?.progressMs ?? 0}
            rangeClassName="drive-player-range h-3"
            timeClassName="mt-3 flex justify-between text-base font-bold text-white/42 tabular-nums"
            trackColor="rgba(255,255,255,0.1)"
          />

          <DriveTransportControls controls={controls} playback={playback} />

          {controls.errorMessage && (
            <PlaybackErrorMessage
              key={controls.errorMessage}
              className="mt-5 max-w-xl text-sm font-semibold text-red-200"
              message={controls.errorMessage}
            />
          )}
        </section>
      </div>
    </main>
  )
}
