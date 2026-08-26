import { createHashHistory, createRouter } from '@tanstack/react-router'

import { queryClient } from '@/shared/config/query-client'

import { routeTree } from './routeTree.gen'

const hashHistory = createHashHistory()

export const router = createRouter({
  routeTree,
  history: hashHistory,
  context: {
    queryClient
  }
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
