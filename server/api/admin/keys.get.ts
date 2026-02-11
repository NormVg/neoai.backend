import { getDatabase, schema } from '~~/server/utils/db'
import { sql } from 'drizzle-orm'

/**
 * GET /api/admin/keys
 *
 * Returns all API keys (with key partially masked for security).
 */
export default defineEventHandler(async () => {
  try {
    const db = getDatabase()

    const keys = await db
      .select()
      .from(schema.apiKeys)
      .orderBy(sql`${schema.apiKeys.createdAt} ASC`)

    // Mask the actual key values — show first 8 and last 4 chars
    const masked = keys.map((k) => ({
      ...k,
      key: maskKey(k.key),
    }))

    return { keys: masked, total: keys.length }
  } catch (error: any) {
    console.error('[admin-keys] Error fetching keys:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch API keys',
    })
  }
})

function maskKey(key: string): string {
  if (key.length <= 12) return '****'
  return key.slice(0, 8) + '...' + key.slice(-4)
}
