import { createFileRoute } from '@tanstack/react-router'

import { PlaybackDisplayPage } from '@/features/playback/components/playback-display-page'

export const Route = createFileRoute('/_authenticated/')({
  component: PlaybackDisplayPage
})
