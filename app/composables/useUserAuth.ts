export const useUserAuth = () => {
  const token = useState<string | null>('user_token', () => null)
  const userInfo = useState<{ id: string; username: string; createdAt: string; plan?: string; planExpiresAt?: string | null; usage?: { count: number; limit: number } } | null>('user_info', () => null)

  function setToken(t: string, user: { id: string; username: string; createdAt: string; plan?: string; planExpiresAt?: string | null; usage?: { count: number; limit: number } }) {
    token.value = t
    userInfo.value = user
    if (import.meta.client) {
      localStorage.setItem('user_token', t)
      localStorage.setItem('user_info', JSON.stringify(user))
    }
  }

  function clearToken() {
    token.value = null
    userInfo.value = null
    if (import.meta.client) {
      localStorage.removeItem('user_token')
      localStorage.removeItem('user_info')
    }
  }

  function loadToken() {
    if (import.meta.client) {
      token.value = localStorage.getItem('user_token')
      const raw = localStorage.getItem('user_info')
      if (raw) {
        try {
          userInfo.value = JSON.parse(raw)
        } catch {
          userInfo.value = null
        }
      }
    }
  }

  function getAuthHeaders(): HeadersInit {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  const isLoggedIn = computed(() => !!token.value)

  return { token, userInfo, setToken, clearToken, loadToken, getAuthHeaders, isLoggedIn }
}
