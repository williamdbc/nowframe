import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'

import { windowQueryKeys } from '../queries/window-query-keys'
import { WindowService } from '../services/window-service'

type WindowState = Awaited<ReturnType<typeof WindowService.getState>>

export function useGetWindowStateQuery(): UseQueryResult<WindowState> {
  return useQuery({
    queryKey: windowQueryKeys.state(),
    queryFn: () => WindowService.getState(),
    staleTime: Number.POSITIVE_INFINITY
  })
}
