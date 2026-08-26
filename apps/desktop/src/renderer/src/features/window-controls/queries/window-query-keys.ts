export const windowQueryKeys = {
  all: ['window'] as const,
  state: () => [...windowQueryKeys.all, 'state'] as const
}
