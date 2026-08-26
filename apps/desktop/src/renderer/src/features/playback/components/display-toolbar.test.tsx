import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SpotifyProfileMenu } from '@/features/authentication/components/spotify-profile-menu'

import { DisplayToolbar } from './display-toolbar'

const accountMenu = (
  <SpotifyProfileMenu
    profile={{
      accountId: 'stable-account-id',
      displayName: 'William',
      imageUrl: null,
      profileUrl: 'https://open.spotify.com/user/public-id'
    }}
    isLoading={false}
    isError={false}
    isLoggingOut={false}
    onRetry={vi.fn()}
    onLogout={vi.fn()}
  />
)

describe('DisplayToolbar', () => {
  it('orders theme, profile and fullscreen actions', () => {
    render(
      <DisplayToolbar
        accountMenu={accountMenu}
        activeThemeName="Default"
        isEnteringFullScreen={false}
        onEnterFullScreen={vi.fn()}
      />
    )

    const toolbar = screen.getByRole('navigation', { name: 'Ações do display' })
    const actions = within(toolbar).getAllByRole('button')

    expect(actions).toEqual([
      screen.getByRole('button', { name: 'Default' }),
      screen.getByRole('button', { name: 'Abrir menu de William' }),
      screen.getByRole('button', { name: 'Entrar em tela cheia' })
    ])
  })

  it('keeps only one menu open and dismisses it outside', async () => {
    const user = userEvent.setup()

    render(
      <DisplayToolbar
        accountMenu={accountMenu}
        activeThemeName="Default"
        isEnteringFullScreen={false}
        onEnterFullScreen={vi.fn()}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Default' }))
    expect(screen.getByRole('menu', { name: 'Temas' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Abrir menu de William' }))
    expect(screen.queryByRole('menu', { name: 'Temas' })).not.toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: 'Conta Spotify' })).toBeInTheDocument()

    await user.click(document.body)
    expect(screen.queryByRole('dialog', { name: 'Conta Spotify' })).not.toBeInTheDocument()
  })
})
