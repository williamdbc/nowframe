import { useGetAppBootstrapQuery } from '@/features/app-bootstrap/hooks/useGetAppBootstrapQuery'
import { SpotifyConnectionStatus } from '@/features/authentication/components/spotify-connection-status'
import { themeRegistry } from '@/features/themes/theme-registry'

export function MusicDisplayPage(): React.JSX.Element {
  const bootstrapQuery = useGetAppBootstrapQuery()
  const ActiveTheme = themeRegistry.default.component

  if (bootstrapQuery.isPending) {
    return <div className="app-status">Preparando o Music Display...</div>
  }

  if (bootstrapQuery.isError) {
    return (
      <div className="app-status" role="alert">
        Não foi possível iniciar o Music Display.
      </div>
    )
  }

  return (
    <>
      <SpotifyConnectionStatus isConfigured={bootstrapQuery.data.spotify.isConfigured} />
      <ActiveTheme playback={null} />
    </>
  )
}
