import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { windowQueryKeys } from '../queries/window-query-keys'

export function useWindowStateSubscription(): void {
  const queryClient = useQueryClient()

  useEffect(
    () =>
      window.musicDisplay.window.onStateChanged((state) => {
        queryClient.setQueryData(windowQueryKeys.state(), state)
      }),
    [queryClient]
  )
}
