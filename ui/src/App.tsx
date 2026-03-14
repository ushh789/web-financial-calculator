import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import './App.scss'
import Topbar from './components/Topbar'
import { useAuth } from './hooks/useAuth'
import { useHashPage } from './hooks/useHashPage'

const AdminPage = lazy(() => import('./components/AdminPage'))
const CalculatorDetails = lazy(() => import('./components/CalculatorDetails'))
const HomeHero = lazy(() => import('./components/HomeHero'))
const LoginPage = lazy(() => import('./components/LoginPage'))

function App() {
  const { page, navigate } = useHashPage()
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const { user, status: authStatus, error: authError, login, logout } = useAuth()

  const themeLabel = useMemo(() => (theme === 'light' ? 'Moon mode' : 'Sun mode'), [theme])
  const requiresAuth = page.kind === 'admin' || page.kind === 'calculator'
  const shouldShowLogin = !user && (page.kind === 'login' || requiresAuth)

  useEffect(() => {
    if (page.kind === 'login' && user) {
      navigate({ kind: 'admin' })
    }
  }, [page.kind, user, navigate])

  const handleLoginSuccess = () => {
    if (page.kind === 'calculator') {
      navigate({ kind: 'calculator', id: page.id })
      return
    }
    navigate({ kind: 'admin' })
  }

  return (
    <div className="page" data-theme={theme}>
      <div className="page__backdrop" aria-hidden="true" />
      <Topbar
        onAdmin={() => navigate({ kind: 'admin' })}
        onLogin={() => navigate({ kind: 'login' })}
        onLogout={logout}
        onToggleTheme={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
        themeLabel={themeLabel}
        user={user}
      />
      <main className="content">
        <Suspense fallback={<div className="detail__state">Loading page...</div>}>
          {shouldShowLogin && (
            <LoginPage
              status={authStatus}
              error={authError}
              onLogin={login}
              onBack={() => navigate({ kind: 'home' })}
              onSuccess={handleLoginSuccess}
            />
          )}
          {!shouldShowLogin && page.kind === 'home' && <HomeHero />}
          {!shouldShowLogin && page.kind === 'admin' && (
            <AdminPage
              onBack={() => navigate({ kind: 'home' })}
              onOpenCalculator={(id) => navigate({ kind: 'calculator', id })}
            />
          )}
          {!shouldShowLogin && page.kind === 'calculator' && (
            <CalculatorDetails
              calculatorId={page.id}
              onBack={() => navigate({ kind: 'admin' })}
              theme={theme}
            />
          )}
        </Suspense>
      </main>
    </div>
  )
}

export default App
