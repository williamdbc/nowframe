import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'

import { queryClient } from '@/shared/config/query-client'

import { router } from './router'
import './styles.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element was not found.')
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
)

if (import.meta.env.DEV && import.meta.env.VITE_THEME_SHOWCASE === 'true') {
  void import('../../../scripts/demo/showcase-themes').then(({ installThemeShowcase }) => {
    installThemeShowcase()
  })
}
