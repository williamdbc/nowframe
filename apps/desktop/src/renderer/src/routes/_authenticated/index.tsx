import { createFileRoute } from '@tanstack/react-router'

import { MusicDisplayPage } from '@/features/playback/components/music-display-page'

export const Route = createFileRoute('/_authenticated/')({
  component: MusicDisplayPage
})
