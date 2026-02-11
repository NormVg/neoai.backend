import { eq } from 'drizzle-orm'
import { getDatabase, schema } from '~~/server/utils/db'

/**
 * PUT /api/admin/mcq/:id
 *
 * Update a MCQ cache entry.
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
    if (body.answer !== undefined) updateData.answer = body.answer
    if (body.selectedOption !== undefined) updateData.selectedOption = body.selectedOption
    if (body.explanation !== undefined) updateData.explanation = body.explanation
    if (body.confidence !== undefined) updateData.confidence = body.confidence
    if (body.question !== undefined) updateData.question = body.question
    if (body.options !== undefined) updateData.options = body.options

    if (Object.keys(updateData).length === 0) {
      throw createError({ statusCode: 400, message: 'No valid fields to update' })
    }

    const result = await db
      .update(schema.mcqCache)
      .set(updateData)
      .where(eq(schema.mcqCache.id, id))
      .returning()

    if (result.length === 0) {
      throw createError({ statusCode: 404, message: 'MCQ cache entry not found' })
    }

    return { success: true, entry: result[0] }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[admin/mcq/update] Error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to update MCQ cache entry',
    })
  }
})
