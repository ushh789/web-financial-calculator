import { useEffect, useState } from 'react'

type Page =
  | { kind: 'home' }
  | { kind: 'login' }
  | { kind: 'admin' }
  | { kind: 'calculator'; id: string }

const getPageFromHash = (): Page => {
  const rawHash = window.location.hash.replace('#', '').trim()
  if (!rawHash) {
    return { kind: 'home' }
  }

  const [route, ...rest] = rawHash.split('/')
  const normalizedRoute = route.toLowerCase()

  if (normalizedRoute === 'admin') {
    return { kind: 'admin' }
  }

  if (normalizedRoute === 'login') {
    return { kind: 'login' }
  }

  if (normalizedRoute === 'calculator' && rest.length > 0) {
    const id = rest.join('/').trim()
    if (id) {
      return { kind: 'calculator', id }
    }
  }

  return { kind: 'home' }
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
    if (next.kind === 'home') {
      window.location.hash = ''
      return
    }

    if (next.kind === 'admin') {
      window.location.hash = '#admin'
      return
    }

    if (next.kind === 'login') {
      window.location.hash = '#login'
      return
    }

    window.location.hash = `#calculator/${next.id}`
  }

  return { page, navigate }
}

export type { Page }
