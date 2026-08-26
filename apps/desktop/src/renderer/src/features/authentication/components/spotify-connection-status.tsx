import { CircleCheck } from 'lucide-react'

export function SpotifyConnectionStatus(): React.JSX.Element {
  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-black/45 px-4 py-2 text-sm font-medium text-white/72 backdrop-blur-xl">
      <CircleCheck aria-hidden="true" className="h-4 w-4 text-[#1ed760]" />
      <span>Spotify conectado</span>
    </div>
  )
}
