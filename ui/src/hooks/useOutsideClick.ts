import { useEffect, type RefObject } from 'react'

export const useOutsideClick = <T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: () => void,
  enabled = true,
) => {
  useEffect(() => {
    if (!enabled) return undefined

    const handleClickOutside = (event: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(event.target as Node)) {
        handler()
      }
    }

    window.addEventListener('mousedown', handleClickOutside)
    return () => window.removeEventListener('mousedown', handleClickOutside)
  }, [enabled, handler, ref])
}
