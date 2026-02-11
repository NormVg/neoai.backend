import { sql } from 'drizzle-orm'
import { getDatabase, schema } from '~~/server/utils/db'

/**
 * GET /api/cache/stats
 *
 * Returns cache analytics: total entries, hit counts, top questions.
 */
export default defineEventHandler(async () => {
  try {
    const db = getDatabase()

    // MCQ stats
    const mcqStats = await db
      .select({
        totalEntries: sql<number>`count(*)::int`,
        totalRequests: sql<number>`coalesce(sum(${schema.mcqCache.requestCount}), 0)::int`,
        avgRequestsPerEntry: sql<number>`coalesce(avg(${schema.mcqCache.requestCount}), 0)`,
      })
      .from(schema.mcqCache)

    // Code stats
    const codeStats = await db
      .select({
        totalEntries: sql<number>`count(*)::int`,
        totalRequests: sql<number>`coalesce(sum(${schema.codeCache.requestCount}), 0)::int`,
        avgRequestsPerEntry: sql<number>`coalesce(avg(${schema.codeCache.requestCount}), 0)`,
      })
      .from(schema.codeCache)

    // Most popular MCQ questions (top 10)
    const topMCQs = await db
      .select({
        question: schema.mcqCache.question,
        requestCount: schema.mcqCache.requestCount,
        lastAccessed: schema.mcqCache.lastAccessed,
      })
      .from(schema.mcqCache)
      .orderBy(sql`${schema.mcqCache.requestCount} DESC`)
      .limit(10)

    // Most popular Code questions (top 10)
    const topCodeQuestions = await db
      .select({
        question: schema.codeCache.question,
        language: schema.codeCache.language,
        requestCount: schema.codeCache.requestCount,
        lastAccessed: schema.codeCache.lastAccessed,
      })
      .from(schema.codeCache)
      .orderBy(sql`${schema.codeCache.requestCount} DESC`)
      .limit(10)

    return {
      mcq: {
        totalCachedQuestions: mcqStats[0]?.totalEntries ?? 0,
        totalCacheHits: mcqStats[0]?.totalRequests ?? 0,
        averageHitsPerQuestion: Number(Number(mcqStats[0]?.avgRequestsPerEntry ?? 0).toFixed(2)),
        topQuestions: topMCQs,
      },
      code: {
        totalCachedQuestions: codeStats[0]?.totalEntries ?? 0,
        totalCacheHits: codeStats[0]?.totalRequests ?? 0,
        averageHitsPerQuestion: Number(Number(codeStats[0]?.avgRequestsPerEntry ?? 0).toFixed(2)),
        topQuestions: topCodeQuestions,
      },
    }
  } catch (error: any) {
    console.error('[cache-stats] Error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch cache stats',
    })
  }
})
