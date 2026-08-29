import '@testing-library/jest-dom/vitest'

/**
 * O jsdom não implementa `matchMedia`. Quem consulta preferências de mídia em runtime —
 * hoje o giro do disco no tema Vinyl, que respeita `prefers-reduced-motion` — quebraria na
 * montagem sem isto. O padrão devolvido é "sem preferência", que é o navegador comum; um
 * teste que precise do contrário substitui a implementação.
 */
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      addEventListener: () => {},
      addListener: () => {},
      dispatchEvent: () => false,
      matches: false,
      media: query,
      onchange: null,
      removeEventListener: () => {},
      removeListener: () => {}
    }) as MediaQueryList
}
