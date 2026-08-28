interface AppBootstrapErrorStateProps {
  onRetry: () => void
}

export function AppBootstrapErrorState({
  onRetry
}: AppBootstrapErrorStateProps): React.JSX.Element {
  return (
    <div className="app-status" role="alert">
      <div className="flex flex-col items-center gap-4 text-center">
        <p>Não foi possível iniciar o Nowframe.</p>
        <button
          className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          type="button"
          onClick={onRetry}
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
