import { Suspense, lazy, useMemo, useState } from 'react'
import './App.scss'
import Topbar from './components/Topbar'
import { useHashPage } from './hooks/useHashPage'

const AdminPage = lazy(() => import('./components/AdminPage'))
const CalculatorDetails = lazy(() => import('./components/CalculatorDetails'))
const HomeHero = lazy(() => import('./components/HomeHero'))

function App() {
  const { page, navigate } = useHashPage()
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  const themeLabel = useMemo(() => (theme === 'light' ? 'Moon mode' : 'Sun mode'), [theme])

  return (
    <div className="page" data-theme={theme}>
      <div className="page__backdrop" aria-hidden="true" />
      <Topbar
        onAdmin={() => navigate({ kind: 'admin' })}
        onToggleTheme={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
        themeLabel={themeLabel}
      />
      <main className="content">
        <Suspense fallback={<div className="detail__state">Loading page...</div>}>
          {page.kind === 'home' && <HomeHero />}
          {page.kind === 'admin' && (
            <AdminPage
              onBack={() => navigate({ kind: 'home' })}
              onOpenCalculator={(id) => navigate({ kind: 'calculator', id })}
            />
          )}
          {page.kind === 'calculator' && (
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
