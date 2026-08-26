import { createFileRoute, redirect } from '@tanstack/react-router'

import { SpotifyLoginPage } from '@/features/authentication/components/spotify-login-page'
import { spotifySessionQueryOptions } from '@/features/authentication/queries/spotify-session-query-options'

export const Route = createFileRoute('/login')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(spotifySessionQueryOptions())

    if (session.status === 'authenticated') {
      throw redirect({ to: '/' })
    }
  },
  component: SpotifyLoginPage
})
