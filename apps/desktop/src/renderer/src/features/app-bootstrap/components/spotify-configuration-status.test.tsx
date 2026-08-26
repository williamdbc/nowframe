import { render, screen } from '@testing-library/react'

import { SpotifyConfigurationStatus } from './spotify-configuration-status'

describe('SpotifyConfigurationStatus', () => {
  it('distinguishes application configuration from account connection', () => {
    render(<SpotifyConfigurationStatus isConfigured />)

    expect(screen.getByText('Spotify configurado')).toBeInTheDocument()
    expect(screen.queryByText('Spotify conectado')).not.toBeInTheDocument()
  })
})
