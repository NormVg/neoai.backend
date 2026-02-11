import { SignJWT, jwtVerify } from 'jose'

/**
 * JWT utility for signing and verifying tokens.
 * Uses HS256 with a shared secret from env.
 */

function getSecret() {
  const config = useRuntimeConfig()
  const secret = config.jwtSecret
  if (!secret) throw new Error('JWT_SECRET not configured')
  return new TextEncoder().encode(secret)
}

interface TokenPayload {
  sub: string // user id or 'admin'
  role: 'user' | 'admin'
  username: string
}

/**
 * Sign a JWT token with 7-day expiry for users, 24h for admin.
 */
export async function signToken(payload: TokenPayload): Promise<string> {
  const expiry = payload.role === 'admin' ? '24h' : '7d'
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiry)
    .sign(getSecret())
}

/**
 * Verify and decode a JWT token.
 * Returns the payload or null if invalid/expired.
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as unknown as TokenPayload
  } catch {
    return null
  }
}

/**
 * Extract Bearer token from Authorization header.
 */
export function extractToken(event: any): string | null {
  const auth = getHeader(event, 'authorization')
  if (!auth?.startsWith('Bearer ')) return null
  return auth.slice(7)
}
