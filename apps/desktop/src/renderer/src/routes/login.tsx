import { createFileRoute } from '@tanstack/react-router'

import { SpotifyLoginPage } from '@/features/authentication/components/spotify-login-page'

export const Route = createFileRoute('/login')({
  component: SpotifyLoginPage
})
