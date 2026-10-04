export const showcaseTiming = {
  countdownMs: 0,
  movementMs: 650,
  menuPauseMs: 220,
  exposureMs: 1000,
  scrollMs: 450
}

type Timing = typeof showcaseTiming

function pause(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    signal.throwIfAborted()
    const abort = (): void => {
      clearTimeout(timer)
      reject(new DOMException('Demonstração interrompida', 'AbortError'))
    }
    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', abort)
      resolve()
    }, ms)
    signal.addEventListener('abort', abort, { once: true })
  })
}

function getTrigger(): HTMLButtonElement {
  const trigger = document.querySelector<HTMLButtonElement>('[data-demo-theme-selector]')
  if (!trigger) throw new Error('Abra o player fora do modo tela cheia antes de iniciar.')

  return trigger
}

async function waitForElement(selector: string, signal: AbortSignal): Promise<HTMLButtonElement> {
  for (let attempt = 0; attempt < 120; attempt++) {
    signal.throwIfAborted()
    const element = document.querySelector<HTMLButtonElement>(selector)
    if (element) return element
    await pause(16, signal)
  }
  throw new Error('Não foi possível encontrar o seletor de temas.')
}

async function moveCursor(
  cursor: HTMLElement,
  x: number,
  y: number,
  duration: number,
  signal: AbortSignal
): Promise<void> {
  cursor.style.transition = `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`
  cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`
  await pause(duration, signal)
}

async function pointAt(
  cursor: HTMLElement,
  element: HTMLElement,
  timing: Timing,
  signal: AbortSignal
): Promise<void> {
  const rect = element.getBoundingClientRect()
  await moveCursor(
    cursor,
    rect.x + rect.width / 2,
    rect.y + rect.height / 2,
    timing.movementMs,
    signal
  )
}

async function selectTheme(
  id: string,
  cursor: HTMLElement,
  signal: AbortSignal,
  timing: Timing
): Promise<void> {
  const trigger = getTrigger()
  await pointAt(cursor, trigger, timing, signal)
  if (trigger.getAttribute('aria-expanded') !== 'true') trigger.click()
  const item = await waitForElement(`[data-demo-theme="${id}"]`, signal)
  item.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' })
  await pause(timing.scrollMs, signal)
  await pointAt(cursor, item, timing, signal)
  await pause(timing.menuPauseMs, signal)
  cursor.classList.add('demo-click')
  item.click()
  await pause(120, signal)
  cursor.classList.remove('demo-click')
  getTrigger().blur()
}

export async function runThemeShowcase(
  cursor: HTMLElement,
  signal: AbortSignal,
  timing: Timing = showcaseTiming
): Promise<void> {
  const initialTheme = getTrigger().dataset.demoThemeSelector
  await pause(timing.countdownMs, signal)
  const trigger = getTrigger()
  await pointAt(cursor, trigger, timing, signal)
  if (trigger.getAttribute('aria-expanded') !== 'true') trigger.click()
  await waitForElement('[data-demo-theme]', signal)
  const menuThemes = Array.from(
    document.querySelectorAll<HTMLButtonElement>('[data-demo-theme]')
  ).map((item) => item.dataset.demoTheme!)
  const initialIndex = menuThemes.indexOf(initialTheme ?? '')
  const nextThemes =
    initialIndex < 0
      ? menuThemes
      : [...menuThemes.slice(initialIndex + 1), ...menuThemes.slice(0, initialIndex)]
  for (const id of nextThemes) {
    await selectTheme(id, cursor, signal, timing)
    await pause(timing.exposureMs, signal)
  }
  if (initialTheme && menuThemes.includes(initialTheme)) {
    await selectTheme(initialTheme, cursor, signal, timing)
  }
}

export function installThemeShowcase(): void {
  const style = document.createElement('style')
  style.textContent = `
    .demo-running, .demo-running * { cursor: none !important; }
    .demo-running .player-theme-chrome { opacity: 1; }
    .demo-cursor { position: fixed; top: 0; left: 0; z-index: 2147483647;
      pointer-events: none; width: 26px; height: 32px; will-change: transform;
      filter: drop-shadow(0 2px 3px #0009); }
    .demo-cursor svg { width: 100%; height: 100%; transition: scale 120ms; }
    .demo-click svg { scale: .8; }
  `
  document.head.append(style)
  let controller: AbortController | undefined
  let mousePosition: { x: number; y: number } | undefined

  window.addEventListener('mousemove', (event) => {
    mousePosition = { x: event.clientX, y: event.clientY }
  })

  window.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape' && controller) {
        event.preventDefault()
        event.stopImmediatePropagation()
        controller.abort()
        return
      }
      if (event.key !== 'F8' || controller || event.repeat) return
      event.preventDefault()
      if (!mousePosition) {
        console.warn('Mova o mouse dentro da janela antes de iniciar a demonstração.')
        return
      }
      const cursor = document.createElement('div')
      cursor.className = 'demo-cursor'
      cursor.setAttribute('aria-hidden', 'true')
      cursor.innerHTML =
        '<svg viewBox="0 0 26 32"><path d="M2 2L2 25L8 19L13 29L18 27L13 17L23 17Z" fill="white" stroke="#161616" stroke-width="1.5" stroke-linejoin="round"/></svg>'
      cursor.style.transform = `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0)`
      document.body.append(cursor)
      document.body.classList.add('demo-running')
      controller = new AbortController()
      void runThemeShowcase(cursor, controller.signal)
        .catch((error: unknown) => {
          if (!(error instanceof Error && error.name === 'AbortError')) {
            console.error('Falha na demonstração dos temas:', error)
          }
        })
        .finally(() => {
          const trigger = document.querySelector<HTMLButtonElement>('[data-demo-theme-selector]')
          if (trigger?.getAttribute('aria-expanded') === 'true') trigger.click()
          cursor.remove()
          document.body.classList.remove('demo-running')
          controller = undefined
        })
    },
    { capture: true }
  )
}
