import { sql } from 'drizzle-orm'
import { ilike } from 'drizzle-orm'
import { getDatabase, schema } from '~~/server/utils/db'

/**
 * GET /api/admin/mcq?page=1&limit=20&search=keyword
 *
 * List all MCQ cache entries with pagination and search.
 */
export default defineEventHandler(async (event) => {
  try {
    const db = getDatabase()
    const query = getQuery(event)

    const page = Math.max(1, Number(query.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20))
    const search = (query.search as string)?.trim() || ''
    const offset = (page - 1) * limit

    // Build where clause
    const whereClause = search
      ? ilike(schema.mcqCache.question, `%${search}%`)
      : undefined

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.mcqCache)
      .where(whereClause)

    const total = countResult[0]?.count ?? 0

    // Get paginated entries
    const entries = await db
      .select()
      .from(schema.mcqCache)
      .where(whereClause)
      .orderBy(sql`${schema.mcqCache.lastAccessed} DESC`)
      .limit(limit)
      .offset(offset)

    return {
      entries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  } catch (error: any) {
    console.error('[admin/mcq] Error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch MCQ cache entries',
    })
  }
})
