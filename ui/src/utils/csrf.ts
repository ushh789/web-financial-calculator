const DEFAULT_CSRF_COOKIE = 'XSRF-TOKEN'
const DEFAULT_CSRF_HEADER = 'X-XSRF-TOKEN'

const isUnsafeMethod = (method: string) => !['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method)

const getCookie = (name: string) => {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : undefined
}

const resolveOrigin = (input: RequestInfo | URL, baseUrl: string) => {
  if (input instanceof Request) {
    return new URL(input.url, baseUrl).origin
  }
  const raw = typeof input === 'string' ? input : input.toString()
  return new URL(raw, baseUrl).origin
}

export const setupCsrfFetch = (apiBaseUrl?: string) => {
  if (typeof window === 'undefined') return
  if ((window as unknown as { __csrfFetchPatched?: boolean }).__csrfFetchPatched) return

  const baseOrigin = apiBaseUrl ? new URL(apiBaseUrl, window.location.href).origin : window.location.origin
  const originalFetch = window.fetch.bind(window)

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(input, init)
    const method = request.method?.toUpperCase() ?? 'GET'
    const targetOrigin = resolveOrigin(input, window.location.href)
    const shouldAttach = targetOrigin === baseOrigin

    const headers = new Headers(request.headers)
    if (shouldAttach && isUnsafeMethod(method)) {
      const token = getCookie(DEFAULT_CSRF_COOKIE)
      if (token && !headers.has(DEFAULT_CSRF_HEADER)) {
        headers.set(DEFAULT_CSRF_HEADER, token)
      }
    }

    const credentials = shouldAttach ? 'include' : request.credentials
    const nextRequest = new Request(request, { headers, credentials })
    return originalFetch(nextRequest)
  }

  ;(window as unknown as { __csrfFetchPatched?: boolean }).__csrfFetchPatched = true
}
