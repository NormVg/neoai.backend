import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { getDatabase, schema } from '~~/server/utils/db'
import { signToken } from '~~/server/utils/auth/jwt'

/**
 * POST /api/auth/register
 *
 * Create a new user account.
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

    if (typeof username !== 'string' || username.trim().length < 3) {
      throw createError({
        statusCode: 400,
        message: 'Username must be at least 3 characters',
      })
    }

    if (typeof password !== 'string' || password.length < 6) {
      throw createError({
        statusCode: 400,
        message: 'Password must be at least 6 characters',
      })
    }

    // Normalize username to lowercase
    const normalizedUsername = username.trim().toLowerCase()

    const db = getDatabase()

    // Hash password with bcrypt (12 rounds)
    const passwordHash = await bcrypt.hash(password, 12)

    const [user] = await db
      .insert(schema.users)
      .values({
        username: normalizedUsername,
        passwordHash,
      })
      .returning({
        id: schema.users.id,
        username: schema.users.username,
        createdAt: schema.users.createdAt,
      })

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
      },
    }
  } catch (error: any) {
    // Handle duplicate username
    if (error.code === '23505') {
      throw createError({
        statusCode: 409,
        message: 'Username already taken',
      })
    }
    if (error.statusCode) throw error
    console.error('[auth/register] Error:', error)
    throw createError({
      statusCode: 500,
      message: 'Registration failed',
    })
  }
})
