import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { getDatabase, schema } from '~~/server/utils/db'
import { signToken } from '~~/server/utils/auth/jwt'

/**
 * POST /api/auth/login
 *
 * Authenticate a user with username/password.
 * Body: { username: string, password: string }
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { username, password } = body

    if (!username || !password) {
      throw createError({
        statusCode: 400,
        message: 'Username and password are required',
      })
    }

    const normalizedUsername = username.trim().toLowerCase()
    const db = getDatabase()

    // Find user by username
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, normalizedUsername))
      .limit(1)

    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Invalid username or password',
      })
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      throw createError({
        statusCode: 401,
        message: 'Invalid username or password',
      })
    }

    // Generate JWT
    const token = await signToken({
      sub: user.id,
      role: 'user',
      username: user.username,
    })

    return {
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt,
        plan: user.plan,
        planExpiresAt: user.planExpiresAt,
      },
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[auth/login] Error:', error)
    throw createError({
      statusCode: 500,
      message: 'Login failed',
    })
  }
})
