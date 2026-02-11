import { eq } from 'drizzle-orm'
import { getDatabase, schema } from '~~/server/utils/db'
import { invalidateKeyCache } from '~~/server/utils/ai/google'

/**
 * DELETE /api/admin/keys/:id
 *
 * Delete an API key permanently.
 */
export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({ statusCode: 400, message: 'Missing key ID' })
    }

    const db = getDatabase()

    const [deleted] = await db
      .delete(schema.apiKeys)
      .where(eq(schema.apiKeys.id, id))
      .returning({ id: schema.apiKeys.id })

    if (!deleted) {
      throw createError({ statusCode: 404, message: 'API key not found' })
    }

    // Invalidate cache so rotation stops using deleted key
    invalidateKeyCache()

    return { success: true, deleted }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[admin-keys] Error deleting key:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to delete API key',
    })
  }
})
