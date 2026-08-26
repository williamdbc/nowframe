import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { spotifySessionQueryOptions } from '@/features/authentication/queries/spotify-session-query-options'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(spotifySessionQueryOptions())

    if (session.status === 'unauthenticated') {
      throw redirect({ to: '/login' })
    }
  },
  component: Outlet
})
