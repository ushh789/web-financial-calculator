import { useRef, useState } from 'react'
import { useOutsideClick } from '../hooks/useOutsideClick'

type TopbarProps = {
  onAdmin: () => void
  onToggleTheme: () => void
  themeLabel: string
}

const Topbar = ({ onAdmin, onToggleTheme, themeLabel }: TopbarProps) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useOutsideClick(menuRef, () => setMenuOpen(false), menuOpen)

  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand__kicker">Web Financial Calculator</span>
        <span className="brand__title">Dashboard</span>
      </div>
      <div className="topbar__actions">
        <button className="btn btn--ghost" type="button" onClick={onToggleTheme}>
          {themeLabel}
        </button>
        <div className="avatar" ref={menuRef}>
          <button
            className="avatar__button"
            type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <span className="avatar__ring">TU</span>
          <span className="avatar__label">Test U.</span>
        </button>
          {menuOpen && (
            <div className="avatar__menu" role="menu">
              <button className="avatar__item" type="button" role="menuitem">
                Profile
              </button>
              <button
                className="avatar__item"
                type="button"
                role="menuitem"
                onClick={() => {
                  onAdmin()
                  setMenuOpen(false)
                }}
              >
                Admin panel
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Topbar
