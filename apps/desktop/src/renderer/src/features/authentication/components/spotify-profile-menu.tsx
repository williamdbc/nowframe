import { ExternalLink, LoaderCircle, LogOut, RefreshCw, UserRound } from 'lucide-react'

import { useDismissibleMenu } from '@/shared/hooks/useDismissibleMenu'

import { SpotifyAuthenticationService } from '../services/spotify-authentication-service'

type SpotifyProfile = Awaited<ReturnType<typeof SpotifyAuthenticationService.getProfile>>

interface SpotifyProfileMenuProps {
  profile: SpotifyProfile | null
  isLoading: boolean
  isError: boolean
  isLoggingOut: boolean
  onRetry: () => void
  onLogout: () => void
}

const menuItemClassName =
  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-white/[0.07] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white'

function ProfileAvatar({
  profile,
  isLoading
}: Pick<SpotifyProfileMenuProps, 'profile' | 'isLoading'>): React.JSX.Element {
  if (isLoading) {
    return <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin" />
  }

  if (profile?.imageUrl) {
    return (
      <img
        className="h-full w-full rounded-full object-cover"
        src={profile.imageUrl}
        alt=""
        aria-hidden="true"
      />
    )
  }

  return <UserRound aria-hidden="true" className="h-5 w-5" />
}

export function SpotifyProfileMenu({
  profile,
  isLoading,
  isError,
  isLoggingOut,
  onRetry,
  onLogout
}: SpotifyProfileMenuProps): React.JSX.Element {
  const displayName = profile?.displayName?.trim() || 'Perfil do Spotify'
  const { closeMenu, containerRef, isOpen, toggleMenu, triggerRef } = useDismissibleMenu()

  const logout = (): void => {
    closeMenu()
    onLogout()
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        className="flex h-11 w-11 cursor-pointer list-none items-center justify-center overflow-hidden rounded-full border border-white/15 bg-[#282828] text-white/75 shadow-lg transition hover:scale-[1.04] hover:border-white/30 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        type="button"
        aria-controls="spotify-profile-menu"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`Abrir menu de ${displayName}`}
        title={displayName}
        onClick={toggleMenu}
      >
        <ProfileAvatar profile={profile} isLoading={isLoading} />
      </button>

      {isOpen && (
        <div
          id="spotify-profile-menu"
          className="absolute top-[calc(100%+0.65rem)] right-0 w-72 rounded-2xl border border-white/10 bg-[#101211]/95 p-2 shadow-2xl backdrop-blur-2xl"
          role="dialog"
          aria-label="Conta Spotify"
        >
          {isError ? (
            <div className="p-3">
              <p className="text-sm font-semibold text-white">Perfil do Spotify</p>
              <p className="mt-1 text-xs leading-5 text-white/50">
                Não foi possível carregar o perfil.
              </p>
              <button
                className={`${menuItemClassName} mt-2 justify-center text-white/75`}
                type="button"
                onClick={onRetry}
              >
                <RefreshCw aria-hidden="true" className="h-4 w-4" />
                Tentar novamente
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 rounded-xl px-3 py-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#282828] text-white/65">
                  <ProfileAvatar profile={profile} isLoading={isLoading} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {isLoading ? 'Carregando perfil...' : displayName}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-white/48">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1ed760]" />
                    Spotify conectado
                  </p>
                </div>
              </div>

              {profile && (
                <a
                  className={`${menuItemClassName} mt-1 text-white/72`}
                  href={profile.profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={closeMenu}
                >
                  <ExternalLink aria-hidden="true" className="h-4 w-4" />
                  Abrir perfil no Spotify
                </a>
              )}
            </>
          )}

          <div className="my-1 border-t border-white/8" />
          <button
            className={`${menuItemClassName} text-red-200/75 hover:bg-red-400/10 hover:text-red-100 disabled:cursor-wait disabled:opacity-45`}
            type="button"
            disabled={isLoggingOut}
            onClick={logout}
          >
            <LogOut aria-hidden="true" className="h-4 w-4" />
            {isLoggingOut ? 'Desconectando...' : 'Desconectar Spotify'}
          </button>
        </div>
      )}
    </div>
  )
}
