export const appBootstrapQueryKeys = {
  all: ['app-bootstrap'] as const,
  state: () => [...appBootstrapQueryKeys.all, 'state'] as const
}
