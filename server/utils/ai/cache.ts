import { createHash } from 'crypto'
import { eq, sql } from 'drizzle-orm'
import { getDatabase, schema } from '~~/server/utils/db'

/**
 * Normalize question text for consistent cache matching.
 * Lowercases, trims, and collapses whitespace.
 */
function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, ' ')
}

/**
 * Generate cache key for MCQ requests.
 * Key = SHA-256 of normalized question + sorted normalized options.
 */
export function generateMCQCacheKey(question: string, options: string[]): string {
  const normalized = normalizeText(question)
  const normalizedOptions = options
    .map(o => normalizeText(o))
    .sort()
  const combined = `mcq||${normalized}||${normalizedOptions.join('||')}`
  return createHash('sha256').update(combined).digest('hex')
}

/**
 * Generate cache key for Code requests.
 * Key = SHA-256 of normalized question + normalized language.
 */
export function generateCodeCacheKey(question: string, language: string): string {
  const normalized = normalizeText(question)
  const normalizedLang = normalizeText(language)
  const combined = `code||${normalized}||${normalizedLang}`
  return createHash('sha256').update(combined).digest('hex')
}

/**
 * Look up MCQ response in cache.
 * Returns null on cache miss or DB error (falls back to AI).
 */
export async function lookupMCQCache(cacheKey: string) {
  try {
    const db = getDatabase()
    const results = await db
      .select()
      .from(schema.mcqCache)
      .where(eq(schema.mcqCache.cacheKey, cacheKey))
      .limit(1)

    if (results.length === 0) return null

    const cached = results[0]

    // Update request count and last accessed (fire and forget)
    db.update(schema.mcqCache)
      .set({
        requestCount: sql`${schema.mcqCache.requestCount} + 1`,
        lastAccessed: sql`now()`,
      })
      .where(eq(schema.mcqCache.id, cached.id))
      .execute()
      .catch((err) => console.error('[cache] Failed to update MCQ hit count:', err))

    console.log(`[cache] MCQ hit (key: ${cacheKey.slice(0, 8)}..., accessed ${cached.requestCount + 1} times)`)

    return {
      answer: cached.answer,
      selectedOption: cached.selectedOption,
      explanation: cached.explanation,
      confidence: cached.confidence,
    }
  } catch (error) {
    console.error('[cache] MCQ lookup error:', error)
    return null // Fallback to AI on cache failure
  }
}

/**
 * Look up Code response in cache.
 * Returns null on cache miss or DB error (falls back to AI).
 */
export async function lookupCodeCache(cacheKey: string) {
  try {
    const db = getDatabase()
    const results = await db
      .select()
      .from(schema.codeCache)
      .where(eq(schema.codeCache.cacheKey, cacheKey))
      .limit(1)

    if (results.length === 0) return null

    const cached = results[0]

    // Update request count and last accessed (fire and forget)
    db.update(schema.codeCache)
      .set({
        requestCount: sql`${schema.codeCache.requestCount} + 1`,
        lastAccessed: sql`now()`,
      })
      .where(eq(schema.codeCache.id, cached.id))
      .execute()
      .catch((err) => console.error('[cache] Failed to update Code hit count:', err))

    console.log(`[cache] Code hit (key: ${cacheKey.slice(0, 8)}..., accessed ${cached.requestCount + 1} times)`)

    return {
      code: cached.code,
      explanation: cached.explanation,
      timeComplexity: cached.timeComplexity,
      spaceComplexity: cached.spaceComplexity,
    }
  } catch (error) {
    console.error('[cache] Code lookup error:', error)
    return null // Fallback to AI on cache failure
  }
}

/**
 * Save MCQ response to cache.
 * Silently fails on error (caching should never break the main flow).
 */
export async function saveMCQCache(
  request: { question: string; options: string[]; code?: string | null },
  response: { answer: number; selectedOption: string; explanation: string; confidence: number },
  cacheKey: string,
) {
  try {
    const db = getDatabase()
    await db.insert(schema.mcqCache).values({
      question: request.question,
      options: request.options,
      code: request.code || null,
      cacheKey,
      answer: response.answer,
      selectedOption: response.selectedOption,
      explanation: response.explanation,
      confidence: response.confidence,
      createdAt: new Date(),
      requestCount: 1,
      lastAccessed: new Date(),
    })
    console.log(`[cache] MCQ response saved (key: ${cacheKey.slice(0, 8)}...)`)
  } catch (error) {
    console.error('[cache] MCQ save error:', error)
    // Don't throw - caching failure shouldn't fail the request
  }
}

/**
 * Save Code response to cache.
 * Silently fails on error (caching should never break the main flow).
 */
export async function saveCodeCache(
  request: { question: string; language: string; inputFormat?: string; outputFormat?: string; testCases?: string },
  response: { code: string; explanation: string; timeComplexity: string; spaceComplexity: string },
  cacheKey: string,
) {
  try {
    const db = getDatabase()
    await db.insert(schema.codeCache).values({
      question: request.question,
      language: request.language,
      inputFormat: request.inputFormat || null,
      outputFormat: request.outputFormat || null,
      testCases: request.testCases || null,
      cacheKey,
      code: response.code,
      explanation: response.explanation,
      timeComplexity: response.timeComplexity,
      spaceComplexity: response.spaceComplexity,
      createdAt: new Date(),
      requestCount: 1,
      lastAccessed: new Date(),
    })
    console.log(`[cache] Code response saved (key: ${cacheKey.slice(0, 8)}...)`)
  } catch (error) {
    console.error('[cache] Code save error:', error)
    // Don't throw - caching failure shouldn't fail the request
  }
}
