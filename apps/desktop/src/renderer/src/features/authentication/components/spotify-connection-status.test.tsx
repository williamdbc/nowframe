import { render, screen } from '@testing-library/react'

import { SpotifyConnectionStatus } from './spotify-connection-status'

describe('SpotifyConnectionStatus', () => {
  it('shows the authenticated state on the protected display', () => {
    render(<SpotifyConnectionStatus />)

    expect(screen.getByText('Spotify conectado')).toBeInTheDocument()
  })
})
