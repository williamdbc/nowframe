import { Disc3, Heart, MonitorSpeaker } from 'lucide-react'

import { PlaybackProgressControl } from '@/features/playback/components/playback-progress-control'
import { PlaybackErrorMessage } from '@/features/playback/components/playback-error-message'
import { PlaybackVolumeControl } from '@/features/playback/components/playback-volume-control'
import type { PlayerThemeProps } from '@/features/themes/core/types/player-theme'
import { getPlayerThemeContent } from '@/features/themes/core/utils/get-player-theme-content'

import { DefaultTransportControls } from './components/default-transport-controls'
import './default-player-theme.css'

export function DefaultPlayerTheme({
  chrome,
  controls,
  playback,
  playbackStatus
}: PlayerThemeProps): React.JSX.Element {
  const content = getPlayerThemeContent(playback, playbackStatus)
  const item = playback?.item ?? null

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08090a] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(30,215,96,0.16),transparent_34%),radial-gradient(circle_at_78%_75%,rgba(61,90,254,0.12),transparent_36%)]" />

      <div className="fixed top-6 left-6 z-20">{chrome.connectionStatus}</div>
      <nav
        className="fixed top-6 right-6 z-20 flex items-start gap-2"
        aria-label="Ações do display"
      >
        {chrome.themeSelector}
        {chrome.accountMenu}
        {chrome.fullscreenControl}
      </nav>

      <div className="relative mx-auto grid min-h-screen max-w-[1500px] grid-cols-[minmax(280px,0.78fr)_minmax(430px,1.22fr)] items-center gap-[clamp(3rem,7vw,8rem)] px-[clamp(3rem,7vw,8rem)] py-12 max-[900px]:grid-cols-1 max-[900px]:py-28">
        <section className="aspect-square w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] shadow-[0_40px_100px_rgba(0,0,0,0.52)]">
          {content.imageUrl ? (
            <img
              src={content.imageUrl}
              alt={`Capa de ${content.collectionName}`}
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
          <h1 className="line-clamp-2 min-w-0 pb-[0.08em] text-[clamp(2.75rem,5vw,6.25rem)] leading-[1.04] font-semibold tracking-[-0.055em] text-balance">
            {content.title}
          </h1>

          <p className="mt-6 truncate text-[clamp(1.3rem,2.5vw,2.3rem)] font-medium text-white/55">
            {content.creatorNames}
          </p>

          {content.collectionName && (
            <p className="mt-2 truncate text-base font-medium text-white/32">
              {content.collectionName}
            </p>
          )}

          {playback && (
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-medium text-white/38">
              <span className="inline-flex items-center gap-2">
                <MonitorSpeaker aria-hidden="true" className="h-4 w-4" />
                {playback.device.name}
              </span>
              <PlaybackVolumeControl
                canSetVolume={playback.capabilities.canSetVolume}
                isPending={controls.isVolumePending}
                onCommitVolume={controls.onCommitVolume}
                onSetVolume={controls.onSetVolume}
                onToggleMute={controls.onToggleMute}
                volumePercent={playback.device.volumePercent}
              />
            </div>
          )}

          <PlaybackProgressControl
            canSeek={Boolean(item && playback?.capabilities.canSeek)}
            className={item || playback ? 'mt-10' : 'mt-14'}
            durationMs={item?.durationMs ?? 0}
            isPending={controls.isSeekPending}
            onSeek={controls.onSeek}
            positionMs={playback?.progressMs ?? 0}
          />

          <div className="relative mt-10">
            <DefaultTransportControls controls={controls} playback={playback} />
            <button
              className={`absolute top-1/2 right-0 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border transition focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#1ed760] disabled:cursor-not-allowed disabled:opacity-30 ${controls.isSaved ? 'border-[#1ed760]/40 bg-[#1ed760]/12 text-[#1ed760]' : 'border-white/10 bg-white/[0.04] text-white/48 hover:bg-white/[0.08] hover:text-white'}`}
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

          {controls.errorMessage && (
            <PlaybackErrorMessage
              key={controls.errorMessage}
              className="mt-4 text-sm font-medium text-red-300"
              message={controls.errorMessage}
            />
          )}
        </section>
      </div>
    </main>
  )
}
