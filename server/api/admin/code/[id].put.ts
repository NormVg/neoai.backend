import { eq } from 'drizzle-orm'
import { getDatabase, schema } from '~~/server/utils/db'

/**
 * PUT /api/admin/code/:id
 *
 * Update a Code cache entry.
 */
export default defineEventHandler(async (event) => {
  try {
    const db = getDatabase()
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({ statusCode: 400, message: 'Missing id parameter' })
    }

    const body = await readBody(event)

    // Only allow updating specific fields
    const updateData: Record<string, any> = {}
    if (body.code !== undefined) updateData.code = body.code
    if (body.explanation !== undefined) updateData.explanation = body.explanation
    if (body.timeComplexity !== undefined) updateData.timeComplexity = body.timeComplexity
    if (body.spaceComplexity !== undefined) updateData.spaceComplexity = body.spaceComplexity
    if (body.question !== undefined) updateData.question = body.question
    if (body.language !== undefined) updateData.language = body.language

    if (Object.keys(updateData).length === 0) {
      throw createError({ statusCode: 400, message: 'No valid fields to update' })
    }

    const result = await db
      .update(schema.codeCache)
      .set(updateData)
      .where(eq(schema.codeCache.id, id))
      .returning()

    if (result.length === 0) {
      throw createError({ statusCode: 404, message: 'Code cache entry not found' })
    }

    return { success: true, entry: result[0] }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[admin/code/update] Error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to update Code cache entry',
    })
  }
})
