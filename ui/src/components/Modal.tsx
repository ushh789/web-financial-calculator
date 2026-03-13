import { useEffect, useId, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  theme: 'light' | 'dark'
}

const Modal = ({ isOpen, onClose, title, subtitle, children, theme }: ModalProps) => {
  const titleId = useId()
  const subtitleId = useId()

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    const body = document.body
    const page = document.querySelector('.page') as HTMLElement | null
    const previousOverflow = body.style.overflow

    body.classList.add('modal-open')
    body.style.overflow = 'hidden'
    if (page) {
      page.setAttribute('aria-hidden', 'true')
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      body.classList.remove('modal-open')
      body.style.overflow = previousOverflow
      if (page) {
        page.removeAttribute('aria-hidden')
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div
      className="modal modal-theme"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={subtitle ? subtitleId : undefined}
      data-theme={theme}
    >
      <div
        className="modal__overlay"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            onClose()
          }
        }}
      >
        <div className="modal__content panel admin__section no-scrollbar">
          <div className="admin__header">
            <div>
              <h3 id={titleId}>{title}</h3>
              {subtitle && (
                <p id={subtitleId} className="admin__subtitle">
                  {subtitle}
                </p>
              )}
            </div>
            <button className="btn btn--ghost" type="button" onClick={onClose}>
              Close
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default Modal
