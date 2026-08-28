import { useEffect } from 'react'

import { useGetWindowStateQuery } from './useGetWindowStateQuery'
import { useSetWindowFullScreenMutation } from './useSetWindowFullScreenMutation'
import { useWindowStateSubscription } from './useWindowStateSubscription'

interface WindowPresentationMode {
  isFullScreen: boolean
  isTransitioning: boolean
  enterFullScreen: () => void
  exitFullScreen: () => void
}

export function useWindowPresentationMode(): WindowPresentationMode {
  const windowStateQuery = useGetWindowStateQuery()
  const setFullScreenMutation = useSetWindowFullScreenMutation()
  const isFullScreen = windowStateQuery.data?.isFullScreen ?? false

  useWindowStateSubscription()

  useEffect(() => {
    const exitFullScreenOnEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && isFullScreen && !setFullScreenMutation.isPending) {
        setFullScreenMutation.mutate(false)
      }
    }

    window.addEventListener('keydown', exitFullScreenOnEscape)
    return () => window.removeEventListener('keydown', exitFullScreenOnEscape)
  }, [isFullScreen, setFullScreenMutation])

  return {
    isFullScreen,
    isTransitioning: windowStateQuery.isPending || setFullScreenMutation.isPending,
    enterFullScreen: () => setFullScreenMutation.mutate(true),
    exitFullScreen: () => setFullScreenMutation.mutate(false)
  }
}
