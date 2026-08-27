import type { PlaybackLoadStatus, PlaybackState } from '@/features/playback/types/playback-state'

interface PlayerThemeContent {
  collectionName: string | null
  creatorNames: string
  imageUrl: string | null
  title: string
}

export function getPlayerThemeContent(
  playback: PlaybackState | null,
  playbackStatus: PlaybackLoadStatus
): PlayerThemeContent {
  const item = playback?.item

  if (item) {
    return {
      collectionName: item.collectionName,
      creatorNames: item.creatorNames.join(', '),
      imageUrl: item.imageUrl,
      title: item.title
    }
  }

  if (playbackStatus === 'loading') {
    return {
      collectionName: null,
      creatorNames: 'Buscando a reprodução atual...',
      imageUrl: null,
      title: 'Sincronizando com Spotify'
    }
  }

  if (playbackStatus === 'error') {
    return {
      collectionName: null,
      creatorNames: 'Verifique sua conexão. Tentaremos novamente automaticamente.',
      imageUrl: null,
      title: 'Não foi possível atualizar'
    }
  }

  return {
    collectionName: null,
    creatorNames: playback
      ? 'O Spotify não disponibilizou os dados deste conteúdo.'
      : 'Dê o play no Spotify para ver a música aqui.',
    imageUrl: null,
    title: playback ? 'Conteúdo sem detalhes' : 'Nada tocando agora'
  }
}
