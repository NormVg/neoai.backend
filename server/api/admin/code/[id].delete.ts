import { eq } from 'drizzle-orm'
import { getDatabase, schema } from '~~/server/utils/db'

/**
 * DELETE /api/admin/code/:id
 *
 * Delete a Code cache entry.
 */
export default defineEventHandler(async (event) => {
  try {
    const db = getDatabase()
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({ statusCode: 400, message: 'Missing id parameter' })
    }

    const result = await db
      .delete(schema.codeCache)
      .where(eq(schema.codeCache.id, id))
      .returning({ id: schema.codeCache.id })

    if (result.length === 0) {
      throw createError({ statusCode: 404, message: 'Code cache entry not found' })
    }

    return { success: true, deleted: id }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[admin/code/delete] Error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to delete Code cache entry',
    })
  }
})
