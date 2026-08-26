import { CircleAlert, CircleCheck } from 'lucide-react'

interface SpotifyConnectionStatusProps {
  isConfigured: boolean
}

export function SpotifyConnectionStatus({
  isConfigured
}: SpotifyConnectionStatusProps): React.JSX.Element {
  return (
    <aside className="fixed top-6 right-6 z-10 flex items-center gap-3 rounded-full border border-white/10 bg-black/45 px-4 py-2 text-sm font-medium text-white/72 backdrop-blur-xl">
      {isConfigured ? (
        <CircleCheck aria-hidden="true" className="h-4 w-4 text-[#1ed760]" />
      ) : (
        <CircleAlert aria-hidden="true" className="h-4 w-4 text-amber-400" />
      )}
      <span>{isConfigured ? 'Spotify configurado' : 'Spotify não configurado'}</span>
    </aside>
  )
}
