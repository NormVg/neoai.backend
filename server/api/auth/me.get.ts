import { eq } from 'drizzle-orm'
import { extractToken, verifyToken } from '~~/server/utils/auth/jwt'
import { getDatabase, schema } from '~~/server/utils/db'

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

  const db = getDatabase()
  const [user] = await db
    .select({ id: schema.users.id, username: schema.users.username, plan: schema.users.plan, planExpiresAt: schema.users.planExpiresAt })
    .from(schema.users)
    .where(eq(schema.users.id, payload.sub))
    .limit(1)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'User not found',
    })
  }

  const now = new Date()
  const isPlanActive =
    user.plan === 'lifetime' ||
    (user.plan !== 'free' && user.planExpiresAt && new Date(user.planExpiresAt) > now)

  console.log('[API] /auth/me user:', user.username, 'plan:', user.plan, 'expires:', user.planExpiresAt)

  return {
    id: user.id,
    role: payload.role,
    username: user.username,
    plan: user.plan,
    planExpiresAt: user.planExpiresAt ?? null,
    hasAccess: isPlanActive,
  }
})
