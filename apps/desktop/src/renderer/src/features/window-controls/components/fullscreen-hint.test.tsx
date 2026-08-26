import { render, screen } from '@testing-library/react'

import { FullscreenHint } from './fullscreen-hint'

describe('FullscreenHint', () => {
  it('explains how to leave presentation mode while fullscreen is active', () => {
    render(<FullscreenHint isFullScreen />)

    expect(screen.getByRole('status')).toHaveTextContent('Pressione ESC para sair da tela cheia')
  })

  it('is absent outside fullscreen', () => {
    render(<FullscreenHint isFullScreen={false} />)

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
