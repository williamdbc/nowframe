import { render, screen } from '@testing-library/react'

import { DefaultPlayerTheme } from './default-player-theme'

describe('DefaultPlayerTheme', () => {
  it('renders the real empty playback state', () => {
    render(<DefaultPlayerTheme playback={null} />)

    expect(screen.getByRole('heading', { name: 'Nada tocando agora' })).toBeInTheDocument()
    expect(screen.getByText('Dê o play no Spotify para ver a música aqui.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reproduzir' })).toBeDisabled()
  })
})
