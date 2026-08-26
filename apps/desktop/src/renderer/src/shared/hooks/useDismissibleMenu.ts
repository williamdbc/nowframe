import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'

interface UseDismissibleMenuResult {
  closeMenu: () => void
  containerRef: RefObject<HTMLDivElement | null>
  isOpen: boolean
  toggleMenu: () => void
  triggerRef: RefObject<HTMLButtonElement | null>
}

export function useDismissibleMenu(): UseDismissibleMenuResult {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return undefined

    const closeWhenOutside = (event: PointerEvent | FocusEvent): void => {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    const closeWithEscape = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return

      event.preventDefault()
      setIsOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener('pointerdown', closeWhenOutside)
    document.addEventListener('focusin', closeWhenOutside)
    document.addEventListener('keydown', closeWithEscape)

    return () => {
      document.removeEventListener('pointerdown', closeWhenOutside)
      document.removeEventListener('focusin', closeWhenOutside)
      document.removeEventListener('keydown', closeWithEscape)
    }
  }, [isOpen])

  return {
    closeMenu: () => setIsOpen(false),
    containerRef,
    isOpen,
    toggleMenu: () => setIsOpen((currentState) => !currentState),
    triggerRef
  }
}
