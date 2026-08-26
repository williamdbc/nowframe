import { render, screen } from '@testing-library/react'

import { DefaultPlayerTheme } from './default-player-theme'

describe('DefaultPlayerTheme', () => {
  it('renders the real empty playback state', () => {
    render(<DefaultPlayerTheme playback={null} />)

    expect(screen.getByRole('heading', { name: 'Nada tocando agora' })).toBeInTheDocument()
    expect(screen.getByText('Conecte sua conta Spotify para começar')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reproduzir' })).toBeDisabled()
  })
})
