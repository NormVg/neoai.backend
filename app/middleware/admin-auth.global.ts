export default defineNuxtRouteMiddleware((to) => {
  // Only guard /admin routes (not /admin/login)
  if (!to.path.startsWith('/admin') || to.path === '/admin/login') {
    return
  }

  const { token, loadToken } = useAdminAuth()

  // Load token from localStorage on client
  loadToken()

  if (!token.value) {
    return navigateTo('/admin/login', { replace: true })
  }
})
