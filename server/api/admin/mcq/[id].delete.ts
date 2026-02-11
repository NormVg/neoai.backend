import { eq } from 'drizzle-orm'
import { getDatabase, schema } from '~~/server/utils/db'

/**
 * DELETE /api/admin/mcq/:id
 *
 * Delete a MCQ cache entry.
 */
export default defineEventHandler(async (event) => {
  try {
    const db = getDatabase()
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({ statusCode: 400, message: 'Missing id parameter' })
    }

    const result = await db
      .delete(schema.mcqCache)
      .where(eq(schema.mcqCache.id, id))
      .returning({ id: schema.mcqCache.id })

    if (result.length === 0) {
      throw createError({ statusCode: 404, message: 'MCQ cache entry not found' })
    }

    return { success: true, deleted: id }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[admin/mcq/delete] Error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to delete MCQ cache entry',
    })
  }
})
