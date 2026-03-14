import { useState, type FormEvent } from 'react'
import type { AuthStatus } from '../hooks/useAuth'

type LoginPageProps = {
  status: AuthStatus
  error: string | null
  onLogin: (username: string, password: string) => Promise<boolean>
  onBack: () => void
  onSuccess: () => void
}

const LoginPage = ({ status, error, onLogin, onBack, onSuccess }: LoginPageProps) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

  const isSubmitting = status === 'authenticating'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLocalError(null)

    if (!username.trim() || !password.trim()) {
      setLocalError('Please enter both username and password.')
      return
    }

    const ok = await onLogin(username.trim(), password)
    if (ok) {
      onSuccess()
    }
  }

  return (
    <section className="login">
      <div className="login__grid">
        <div className="panel login__panel">
          <span className="login__eyebrow">Secure Workspace</span>
          <h1 className="login__title">Sign in to the admin console</h1>
          <p className="login__subtitle">
            Access calculators, versions, and operational controls secured by the API&apos;s cookie-based authentication.
          </p>
          <div className="login__callout">
            <div className="login__callout-item">
              <span className="login__callout-label">Auth flow</span>
              <span className="login__callout-value">POST /auth/login</span>
            </div>
            <div className="login__callout-item">
              <span className="login__callout-label">Session</span>
              <span className="login__callout-value">HttpOnly cookies</span>
            </div>
            <div className="login__callout-item">
              <span className="login__callout-label">API base</span>
              <span className="login__callout-value">{apiBaseUrl}</span>
            </div>
          </div>
          <div className="login__note">
            <p>
              Use the credentials provisioned in your API seed data. Your session is refreshed with
              <span className="login__note-code"> POST /auth/refresh</span>.
            </p>
          </div>
        </div>
        <div className="panel panel--accent login__panel">
          <h2>Welcome back</h2>
            <p className="login__subtitle">
              Enter your account details to continue. We keep your access token in a secure cookie.
            </p>
          <form className="login__form" onSubmit={handleSubmit}>
            <label className="field">
              <span className="field__label">Username</span>
              <input
                className="field__input"
                type="text"
                name="username"
                autoComplete="username"
                placeholder="e.g. admin"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </label>
            <label className="field">
              <span className="field__label">Password</span>
              <input
                className="field__input"
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="Your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            {(localError || error) && (
              <div className="form-status form-status--error" role="alert">
                {localError ?? error}
              </div>
            )}
            <div className="login__actions">
              <button className="btn btn--ghost" type="button" onClick={onBack}>
                Back to home
              </button>
              <button className="btn btn--primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
            {status === 'checking' && (
              <div className="form-status form-status--success">
                Checking existing session...
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}

export default LoginPage
