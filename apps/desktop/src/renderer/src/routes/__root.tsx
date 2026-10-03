import type { QueryClient } from '@tanstack/react-query'
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'

import { WindowDragRegion } from '@/features/window-controls/components/window-drag-region'

export interface RouterContext {
  queryClient: QueryClient
}

function RootLayout(): React.JSX.Element {
  return (
    <>
      <WindowDragRegion />
      <Outlet />
    </>
  )
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout
})
