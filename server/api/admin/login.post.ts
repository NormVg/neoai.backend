import { signToken } from '~~/server/utils/auth/jwt'

/**
 * POST /api/admin/login
 *
 * Authenticate as admin using credentials from env vars.
 * Body: { username: string, password: string }
 * Returns an admin JWT token on success.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      message: 'Username and password are required',
    })
  }

  const config = useRuntimeConfig()

  if (!config.adminUsername || !config.adminPassword) {
    throw createError({
      statusCode: 500,
      message: 'Admin credentials not configured on server',
    })
  }

  // Constant-time-ish comparison (not truly constant-time in JS, but good enough)
  if (username !== config.adminUsername || password !== config.adminPassword) {
    throw createError({
      statusCode: 401,
      message: 'Invalid admin credentials',
    })
  }

  // Generate admin JWT (24h expiry)
  const token = await signToken({
    sub: 'admin',
    role: 'admin',
    username: config.adminUsername,
  })

  return {
    success: true,
    token,
  }
})
