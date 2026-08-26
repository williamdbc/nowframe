import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SpotifyProfileMenu } from './spotify-profile-menu'

const profile = {
  accountId: 'stable-account-id',
  displayName: 'William',
  imageUrl: 'https://i.scdn.co/image/profile',
  profileUrl: 'https://open.spotify.com/user/public-id'
}

describe('SpotifyProfileMenu', () => {
  it('uses the profile image as the account menu trigger', async () => {
    const user = userEvent.setup()

    render(
      <SpotifyProfileMenu
        profile={profile}
        isLoading={false}
        isError={false}
        isLoggingOut={false}
        onRetry={vi.fn()}
        onLogout={vi.fn()}
      />
    )

    const menuTrigger = screen.getByLabelText('Abrir menu de William')

    expect(menuTrigger.querySelector('img')).toHaveAttribute('src', profile.imageUrl)
    await user.click(menuTrigger)

    expect(screen.getByText('William')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Abrir perfil no Spotify' })).toHaveAttribute(
      'href',
      profile.profileUrl
    )
  })

  it('offers logout from the profile menu', async () => {
    const user = userEvent.setup()
    const onLogout = vi.fn()

    render(
      <SpotifyProfileMenu
        profile={profile}
        isLoading={false}
        isError={false}
        isLoggingOut={false}
        onRetry={vi.fn()}
        onLogout={onLogout}
      />
    )

    await user.click(screen.getByLabelText('Abrir menu de William'))
    await user.click(screen.getByRole('button', { name: 'Desconectar Spotify' }))

    expect(onLogout).toHaveBeenCalledOnce()
    expect(screen.queryByRole('dialog', { name: 'Conta Spotify' })).not.toBeInTheDocument()
  })

  it('closes when clicking outside or pressing Escape', async () => {
    const user = userEvent.setup()

    render(
      <SpotifyProfileMenu
        profile={profile}
        isLoading={false}
        isError={false}
        isLoggingOut={false}
        onRetry={vi.fn()}
        onLogout={vi.fn()}
      />
    )

    const menuTrigger = screen.getByLabelText('Abrir menu de William')

    await user.click(menuTrigger)
    await user.click(document.body)
    expect(screen.queryByRole('dialog', { name: 'Conta Spotify' })).not.toBeInTheDocument()

    await user.click(menuTrigger)
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: 'Conta Spotify' })).not.toBeInTheDocument()
    expect(menuTrigger).toHaveFocus()
  })
})
