import { Disc3, Heart, MonitorSpeaker } from 'lucide-react'

import { PlaybackErrorMessage } from '@/features/playback/components/playback-error-message'
import { PlaybackProgressControl } from '@/features/playback/components/playback-progress-control'
import { PlaybackVolumeControl } from '@/features/playback/components/playback-volume-control'
import type { PlayerThemeProps } from '@/features/themes/core/types/player-theme'
import { getPlayerThemeContent } from '@/features/themes/core/utils/get-player-theme-content'

import { TracklistCarousel } from './components/tracklist-carousel'
import { TracklistTransportControls } from './components/tracklist-transport-controls'
import './tracklist-player-theme.css'

export function TracklistPlayerTheme({
  chrome,
  controls,
  playback,
  playbackStatus,
  tracklist
}: PlayerThemeProps): React.JSX.Element {
  const content = getPlayerThemeContent(playback, playbackStatus)
  const item = playback?.item ?? null
  const backgroundImageUrl = tracklist.contextImageUrl ?? content.imageUrl

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#111a16] text-white">
      {backgroundImageUrl && (
        <img
          src={backgroundImageUrl}
          alt=""
          aria-hidden="true"
          className="absolute -inset-16 h-[calc(100%+8rem)] w-[calc(100%+8rem)] scale-110 object-cover opacity-30 blur-[100px] saturate-90"
        />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(10,18,14,0.4),rgba(7,13,10,0.76))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(255,255,255,0.055),transparent_42%)]" />

      <div className="fixed top-6 left-6 z-20">{chrome.connectionStatus}</div>
      <nav
        className="fixed top-6 right-6 z-20 flex items-start gap-2"
        aria-label="Ações do display"
      >
        {chrome.themeSelector}
        {chrome.accountMenu}
        {chrome.fullscreenControl}
      </nav>

      <section className="tracklist-theme relative mx-auto flex min-h-screen w-full max-w-[1800px] flex-col px-6 pt-20 pb-5 text-center">
        <div className="tracklist-now-playing mx-auto w-full max-w-3xl">
          <div className="tracklist-main-cover mx-auto aspect-square w-[clamp(4rem,12vh,7rem)] overflow-hidden rounded-2xl border border-white/15 bg-white/[0.06] shadow-[0_18px_55px_rgba(0,0,0,0.38)]">
            {content.imageUrl ? (
              <img
                src={content.imageUrl}
                alt={`Capa principal de ${content.collectionName}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Disc3 aria-hidden="true" className="h-1/3 w-1/3 text-white/24" />
                <span className="sr-only">Nenhuma capa principal disponível</span>
              </div>
            )}
          </div>

          <div className="tracklist-details min-w-0">
            <h1 className="tracklist-title mt-4 line-clamp-1 pb-1 text-[clamp(2.1rem,4vw,4.5rem)] leading-none font-semibold tracking-[-0.045em] text-balance">
              {content.title}
            </h1>
            <p className="mt-2 truncate text-[clamp(1rem,1.7vw,1.4rem)] font-medium text-white/68">
              {content.creatorNames}
            </p>
            {content.collectionName && (
              <p className="mt-1 truncate text-sm text-white/44">{content.collectionName}</p>
            )}

            <PlaybackProgressControl
              accentColor="#8ee3c2"
              canSeek={Boolean(item && playback?.capabilities.canSeek)}
              className="tracklist-progress mt-4"
              durationMs={item?.durationMs ?? 0}
              isPending={controls.isSeekPending}
              onSeek={controls.onSeek}
              positionMs={playback?.progressMs ?? 0}
              timeClassName="mt-2 flex justify-between text-xs font-medium text-white/48 tabular-nums"
              trackColor="rgba(255,255,255,0.2)"
            />

            <div className="tracklist-controls relative mt-3">
              <TracklistTransportControls controls={controls} playback={playback} />
              <button
                className={`absolute top-1/2 right-0 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#8ee3c2] disabled:cursor-not-allowed disabled:opacity-30 ${controls.isSaved ? 'bg-[#8ee3c2]/15 text-[#8ee3c2]' : 'text-white/55 hover:bg-white/[0.1] hover:text-white/85'}`}
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
              <div className="tracklist-device mt-3 flex items-center justify-center gap-5 text-xs font-medium text-white/52">
                <span className="inline-flex max-w-48 items-center gap-2 truncate">
                  <MonitorSpeaker aria-hidden="true" className="h-3.5 w-3.5" />
                  {playback.device.name}
                </span>
                <PlaybackVolumeControl
                  accentColor="#8ee3c2"
                  buttonClassName="text-[#8ee3c2]"
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
                className="mt-3 text-sm font-medium text-red-200"
                message={controls.errorMessage}
              />
            )}
          </div>
        </div>

        <div className="tracklist-carousel mt-auto min-h-0 pt-3">
          <TracklistCarousel
            contextName={tracklist.contextName}
            currentTrackId={item?.id ?? null}
            fallbackImageUrl={tracklist.contextImageUrl ?? content.imageUrl}
            isPending={tracklist.isPending}
            isPlayPending={tracklist.isPlayPending}
            onPlayTrack={tracklist.onPlayTrack}
            tracks={tracklist.tracks}
          />
        </div>
      </section>
    </main>
  )
}
