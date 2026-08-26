import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'

import { windowQueryKeys } from '../queries/window-query-keys'
import { WindowService } from '../services/window-service'

type WindowState = Awaited<ReturnType<typeof WindowService.setFullScreen>>

export function useSetWindowFullScreenMutation(): UseMutationResult<WindowState, Error, boolean> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (isFullScreen: boolean) => WindowService.setFullScreen(isFullScreen),
    onSuccess: (state) => queryClient.setQueryData(windowQueryKeys.state(), state)
  })
}
