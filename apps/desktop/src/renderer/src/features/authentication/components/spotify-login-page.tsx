import { useNavigate } from '@tanstack/react-router'
import { AudioLines, LoaderCircle, LockKeyhole, Music2 } from 'lucide-react'

import { AppBootstrapErrorState } from '@/features/app-bootstrap/components/app-bootstrap-error-state'
import { AppBootstrapLoadingState } from '@/features/app-bootstrap/components/app-bootstrap-loading-state'
import { SpotifyConfigurationStatus } from '@/features/app-bootstrap/components/spotify-configuration-status'
import { useGetAppBootstrapQuery } from '@/features/app-bootstrap/hooks/useGetAppBootstrapQuery'

import { useLoginWithSpotifyMutation } from '../hooks/useLoginWithSpotifyMutation'

export function SpotifyLoginPage(): React.JSX.Element {
  const bootstrapQuery = useGetAppBootstrapQuery()
  const loginMutation = useLoginWithSpotifyMutation()
  const navigate = useNavigate()

  if (bootstrapQuery.isPending) {
    return <AppBootstrapLoadingState />
  }

  if (bootstrapQuery.isError) {
    return <AppBootstrapErrorState onRetry={() => void bootstrapQuery.refetch()} />
  }

  const isSpotifyConfigured = bootstrapQuery.data.spotify.isConfigured

  const loginWithSpotify = (): void => {
    loginMutation.mutate(undefined, {
      onSuccess: (session) => {
        if (session.status === 'authenticated') void navigate({ to: '/' })
      }
    })
  }

  return (
    <main className="relative grid h-screen place-items-center overflow-x-hidden overflow-y-auto bg-[#08090a] px-6 py-6 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(30,215,96,0.2),transparent_35%),radial-gradient(circle_at_82%_82%,rgba(61,90,254,0.15),transparent_38%)]" />
      <div className="absolute top-[-22rem] left-1/2 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full border border-white/[0.04]" />

      <section className="relative w-full max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.045] p-8 shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:p-10">
        <div className="flex items-start justify-between gap-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1ed760] text-[#071109] shadow-[0_16px_40px_rgba(30,215,96,0.2)]">
            <AudioLines aria-hidden="true" className="h-7 w-7" />
          </div>
          <SpotifyConfigurationStatus isConfigured={isSpotifyConfigured} />
        </div>

        <p className="mt-8 text-sm font-semibold tracking-[0.25em] text-[#1ed760] uppercase">
          Music Display
        </p>
        <h1 className="mt-3 text-[clamp(2.7rem,6vw,4rem)] leading-[0.98] font-semibold tracking-[-0.055em] text-balance">
          Seu Spotify, em outra tela.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-white/55">
          Conecte sua conta para acompanhar a reprodução e controlar suas músicas em um display
          dedicado.
        </p>

        <button
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-[#1ed760] px-6 py-4 font-semibold text-[#071109] transition hover:bg-[#28e86b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1ed760] disabled:cursor-not-allowed disabled:opacity-55"
          type="button"
          disabled={!isSpotifyConfigured || loginMutation.isPending}
          onClick={loginWithSpotify}
        >
          {loginMutation.isPending ? (
            <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin" />
          ) : (
            <Music2 aria-hidden="true" className="h-5 w-5" />
          )}
          {loginMutation.isPending ? 'Aguardando autorização...' : 'Conectar com Spotify'}
        </button>

        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-white/38">
          <LockKeyhole aria-hidden="true" className="h-4 w-4" />
          <span>Login seguro via PKCE. Seus tokens não são enviados para esta tela.</span>
        </div>

        {loginMutation.isError && (
          <p className="mt-5 text-center text-sm text-red-300" role="alert">
            {loginMutation.error.message}
          </p>
        )}

        <p className="mt-7 border-t border-white/8 pt-6 text-center text-sm text-white/38">
          Permissões solicitadas: identificar seu perfil, ler e controlar sua reprodução.
        </p>
      </section>
    </main>
  )
}
