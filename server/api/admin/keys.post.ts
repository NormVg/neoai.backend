import { getDatabase, schema } from '~~/server/utils/db'
import { invalidateKeyCache } from '~~/server/utils/ai/google'

/**
 * POST /api/admin/keys
 *
 * Add a new API key.
 * Body: { label: string, key: string }
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { label, key } = body

    if (!label || !key) {
      throw createError({
        statusCode: 400,
        message: 'Both label and key are required',
      })
    }

    if (typeof key !== 'string' || key.trim().length < 10) {
      throw createError({
        statusCode: 400,
        message: 'Invalid API key format',
      })
    }

    const db = getDatabase()

    const [inserted] = await db
      .insert(schema.apiKeys)
      .values({
        label: label.trim(),
        key: key.trim(),
        active: true,
      })
      .returning()

    // Invalidate the in-memory key cache so rotation picks up the new key
    invalidateKeyCache()

    return {
      success: true,
      key: {
        ...inserted,
        key: maskKey(inserted.key),
      },
    }
  } catch (error: any) {
    // Handle duplicate key
    if (error.code === '23505') {
      throw createError({
        statusCode: 409,
        message: 'This API key already exists',
      })
    }
    if (error.statusCode) throw error
    console.error('[admin-keys] Error adding key:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to add API key',
    })
  }
})

function maskKey(key: string): string {
  if (key.length <= 12) return '****'
  return key.slice(0, 8) + '...' + key.slice(-4)
}
