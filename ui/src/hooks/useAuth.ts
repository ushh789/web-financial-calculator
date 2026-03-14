import { useCallback, useEffect, useState } from 'react'

export type AuthUser = {
  id?: string
  username?: string
  email?: string
  firstName?: string
  lastName?: string
  profilePictureUrl?: string
  role?: string
}

type AuthStatus = 'checking' | 'ready' | 'authenticating'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

const parseJsonSafely = async <T,>(response: Response) => {
  if (response.status === 204) return undefined
  const text = await response.text()
  if (!text) return undefined
  return JSON.parse(text) as T
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('checking')
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setStatus('checking')
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        setUser(null)
        return false
      }

      const data = await parseJsonSafely<AuthUser>(response)
      setUser(data ?? null)
      return true
    } catch (err) {
      setUser(null)
      return false
    } finally {
      setStatus('ready')
    }
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    setStatus('authenticating')
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const message = response.status === 401 ? 'Invalid username or password.' : 'Login failed.'
        setError(message)
        setUser(null)
        return false
      }

      const data = await parseJsonSafely<AuthUser>(response)
      setUser(data ?? null)
      return true
    } catch (err) {
      setError('Login failed. Check the API connection and try again.')
      setUser(null)
      return false
    } finally {
      setStatus('ready')
    }
  }, [])

  const logout = useCallback(async () => {
    setStatus('authenticating')
    setError(null)

    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (err) {
      // Ignore logout errors; always clear local state.
    } finally {
      setUser(null)
      setStatus('ready')
    }
  }, [])

  useEffect(() => {
    let isActive = true

    refresh().finally(() => {
      if (!isActive) return
    })

    return () => {
      isActive = false
    }
  }, [refresh])

  return {
    user,
    status,
    error,
    login,
    logout,
    refresh,
  }
}

export type { AuthStatus }
