export default defineNuxtRouteMiddleware((to) => {
  // Only guard /profile route
  if (to.path !== '/profile') {
    return
  }

  const { token, loadToken } = useUserAuth()

  // Load token from localStorage on client
  loadToken()

  if (!token.value) {
    return navigateTo('/login', { replace: true })
  }
})
