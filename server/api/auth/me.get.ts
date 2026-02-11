import { extractToken, verifyToken } from '~~/server/utils/auth/jwt'

/**
 * GET /api/auth/me
 *
 * Returns the current authenticated user from the JWT token.
 * Requires: Authorization: Bearer <token>
 */
export default defineEventHandler(async (event) => {
  const token = extractToken(event)
  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Not authenticated',
    })
  }

  const payload = await verifyToken(token)
  if (!payload) {
    throw createError({
      statusCode: 401,
      message: 'Invalid or expired token',
    })
  }

  return {
    id: payload.sub,
    role: payload.role,
    username: payload.username,
  }
})
