import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'

import { appBootstrapQueryKeys } from '../queries/app-bootstrap-query-keys'
import { AppBootstrapService } from '../services/app-bootstrap-service'

type AppBootstrapState = Awaited<ReturnType<typeof AppBootstrapService.getState>>

export function useGetAppBootstrapQuery(): UseQueryResult<AppBootstrapState> {
  return useQuery({
    queryKey: appBootstrapQueryKeys.state(),
    queryFn: () => AppBootstrapService.getState()
  })
}
