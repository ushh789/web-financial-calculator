import { useMemo, useRef, useState } from 'react'
import { useOutsideClick } from '../hooks/useOutsideClick'
import type { AuthUser } from '../hooks/useAuth'

type TopbarProps = {
  onAdmin: () => void
  onLogin: () => void
  onLogout: () => void
  onToggleTheme: () => void
  themeLabel: string
  user: AuthUser | null
}

const Topbar = ({ onAdmin, onLogin, onLogout, onToggleTheme, themeLabel, user }: TopbarProps) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useOutsideClick(menuRef, () => setMenuOpen(false), menuOpen)

  const displayName = useMemo(() => {
    if (!user) return 'Guest'
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
    return fullName || user.username || user.email || 'Account'
  }, [user])

  const initials = useMemo(() => {
    if (!user) return 'GU'
    const tokens = [user.firstName, user.lastName].filter(Boolean).join(' ').trim().split(' ').filter(Boolean)
    if (tokens.length >= 2) {
      return `${tokens[0][0]}${tokens[1][0]}`.toUpperCase()
    }
    const fallback = user.username || user.email || 'Account'
    return fallback.slice(0, 2).toUpperCase()
  }, [user])

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
        {!user ? (
          <button className="btn btn--primary" type="button" onClick={onLogin}>
            Sign in
          </button>
        ) : (
          <div className="avatar" ref={menuRef}>
            <button
              className="avatar__button"
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <span className="avatar__ring">{initials}</span>
              <span className="avatar__label">{displayName}</span>
            </button>
            {menuOpen && (
              <div className="avatar__menu" role="menu">
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
                <button
                  className="avatar__item"
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onLogout()
                    setMenuOpen(false)
                  }}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

export default Topbar
