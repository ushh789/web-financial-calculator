import { useEffect, useState } from 'react'

type Page = 'home' | 'admin'

const getPageFromHash = (): Page => {
  const hash = window.location.hash.replace('#', '').trim().toLowerCase()
  return hash === 'admin' ? 'admin' : 'home'
}

export const useHashPage = () => {
  const [page, setPage] = useState<Page>(() => getPageFromHash())

  useEffect(() => {
    const handleHashChange = () => {
      setPage(getPageFromHash())
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigate = (next: Page) => {
    setPage(next)
    window.location.hash = next === 'home' ? '' : `#${next}`
  }

  return { page, navigate }
}

export type { Page }
