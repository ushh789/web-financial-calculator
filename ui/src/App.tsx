import './App.scss'
import AdminPage from './components/AdminPage'
import HomeHero from './components/HomeHero'
import Topbar from './components/Topbar'
import { useHashPage } from './hooks/useHashPage'

function App() {
  const { page, navigate } = useHashPage()

  return (
    <div className="page">
      <Topbar onAdmin={() => navigate('admin')} />
      <main className="content">
        {page === 'home' ? (
          <HomeHero/>
        ) : (
          <AdminPage onBack={() => navigate('home')} />
        )}
      </main>
    </div>
  )
}

export default App
