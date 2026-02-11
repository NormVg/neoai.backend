import { extractToken, verifyToken } from '~~/server/utils/auth/jwt'

/**
 * Middleware to protect all /api/admin/* routes.
 * Requires a valid admin JWT in the Authorization header.
 * Skips /api/admin/login (so you can actually log in).
 */
export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname

  // Only protect /api/admin/* routes
  if (!path.startsWith('/api/admin')) return

  // Allow the login endpoint through
  if (path === '/api/admin/login') return

  // Allow OPTIONS preflight
  if (getMethod(event) === 'OPTIONS') return

  const token = extractToken(event)
  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Admin authentication required',
    })
  }

  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') {
    throw createError({
      statusCode: 403,
      message: 'Admin access denied',
    })
  }

  // Attach admin info to event context for downstream handlers
  event.context.admin = payload
})
