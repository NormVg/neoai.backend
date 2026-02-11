import { eq } from 'drizzle-orm'
import { getDatabase, schema } from '~~/server/utils/db'
import { invalidateKeyCache } from '~~/server/utils/ai/google'

/**
 * PUT /api/admin/keys/:id
 *
 * Update an API key (toggle active, rename label).
 * Body: { label?: string, active?: boolean }
 */
export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({ statusCode: 400, message: 'Missing key ID' })
    }

    const body = await readBody(event)
    const updates: Record<string, any> = {}

    if (body.label !== undefined) updates.label = body.label.trim()
    if (body.active !== undefined) updates.active = Boolean(body.active)

    if (Object.keys(updates).length === 0) {
      throw createError({ statusCode: 400, message: 'No fields to update' })
    }

    const db = getDatabase()

    const [updated] = await db
      .update(schema.apiKeys)
      .set(updates)
      .where(eq(schema.apiKeys.id, id))
      .returning()

    if (!updated) {
      throw createError({ statusCode: 404, message: 'API key not found' })
    }

    // Invalidate cache so rotation picks up changes
    invalidateKeyCache()

    return {
      success: true,
      key: {
        ...updated,
        key: maskKey(updated.key),
      },
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[admin-keys] Error updating key:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to update API key',
    })
  }
})

function maskKey(key: string): string {
  if (key.length <= 12) return '****'
  return key.slice(0, 8) + '...' + key.slice(-4)
}
