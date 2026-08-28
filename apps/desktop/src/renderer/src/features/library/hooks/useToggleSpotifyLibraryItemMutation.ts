import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'

import type { SpotifyLibraryItemState } from '../../../../../contracts/nowframe-api'
import { spotifyLibraryQueryKeys } from '../queries/spotify-library-query-keys'
import { SpotifyLibraryService } from '../services/spotify-library-service'
import type { ToggleLibraryItemMutationVariables } from '../types/toggle-library-item-mutation-variables'

interface ToggleLibraryItemMutationContext {
  previousState: SpotifyLibraryItemState | undefined
}

async function toggleLibraryItem({
  shouldSave,
  uri
}: ToggleLibraryItemMutationVariables): Promise<void> {
  return shouldSave ? SpotifyLibraryService.saveItem(uri) : SpotifyLibraryService.removeItem(uri)
}

export function useToggleSpotifyLibraryItemMutation(): UseMutationResult<
  void,
  Error,
  ToggleLibraryItemMutationVariables,
  ToggleLibraryItemMutationContext
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: toggleLibraryItem,
    onMutate: async ({ shouldSave, uri }) => {
      const queryKey = spotifyLibraryQueryKeys.item(uri)
      await queryClient.cancelQueries({ queryKey })
      const previousState = queryClient.getQueryData<SpotifyLibraryItemState>(queryKey)

      queryClient.setQueryData<SpotifyLibraryItemState>(queryKey, {
        isSaved: shouldSave,
        uri
      })

      return { previousState }
    },
    onError: (_error, { uri }, context) => {
      queryClient.setQueryData(spotifyLibraryQueryKeys.item(uri), context?.previousState)
    }
  })
}
