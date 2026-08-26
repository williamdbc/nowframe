import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import { AppBootstrapErrorState } from './app-bootstrap-error-state'
import { AppBootstrapLoadingState } from './app-bootstrap-loading-state'

describe('app bootstrap states', () => {
  it('announces that the application is loading', () => {
    render(<AppBootstrapLoadingState />)

    expect(screen.getByRole('status')).toHaveTextContent('Preparando o Music Display...')
  })

  it('allows retrying after an initialization error', () => {
    const onRetry = vi.fn()

    render(<AppBootstrapErrorState onRetry={onRetry} />)
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(onRetry).toHaveBeenCalledOnce()
  })
})
