export const useAdminAuth = () => {
  const token = useState<string | null>('admin_token', () => null)

  function setToken(t: string) {
    token.value = t
    if (import.meta.client) {
      localStorage.setItem('admin_token', t)
    }
  }

  function clearToken() {
    token.value = null
    if (import.meta.client) {
      localStorage.removeItem('admin_token')
    }
  }

  function loadToken() {
    if (import.meta.client) {
      token.value = localStorage.getItem('admin_token')
    }
  }

  function getAuthHeaders(): HeadersInit {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  return { token, setToken, clearToken, loadToken, getAuthHeaders }
}
