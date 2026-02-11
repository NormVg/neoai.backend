export default defineNuxtRouteMiddleware((to) => {
  // Only guard /admin routes (not /admin/login)
  if (!to.path.startsWith('/admin') || to.path === '/admin/login') {
    return
  }

  // Client-side: check localStorage for admin token
  if (import.meta.client) {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      return navigateTo('/admin/login')
    }
  }
})
