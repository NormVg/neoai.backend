import { eq } from 'drizzle-orm'
import { getDatabase, schema } from '~~/server/utils/db'

/**
 * GET /api/admin/migrate-mcq-options
 *
 * One-time migration: fix selectedOption for all MCQ cache entries.
 * Sets selected_option = options[answer - 1] to correct AI mismatches.
 * Safe to run multiple times (idempotent).
 *
 * DELETE THIS FILE after running the migration.
 */
export default defineEventHandler(async () => {
  const db = getDatabase()

  // Fetch all MCQ cache entries
  const entries = await db
    .select({
      id: schema.mcqCache.id,
      options: schema.mcqCache.options,
      answer: schema.mcqCache.answer,
      selectedOption: schema.mcqCache.selectedOption,
    })
    .from(schema.mcqCache)

  let fixed = 0
  let skipped = 0
  let errors = 0
  const details: { id: string; old: string; new: string }[] = []

  for (const entry of entries) {
    const options = entry.options as string[]
    const answerIndex = entry.answer - 1

    // Validate answer index is in range
    if (answerIndex < 0 || answerIndex >= options.length) {
      errors++
      continue
    }

    const correctOption = options[answerIndex]

    // Skip if already correct
    if (entry.selectedOption === correctOption) {
      skipped++
      continue
    }

    // Update the entry
    await db
      .update(schema.mcqCache)
      .set({ selectedOption: correctOption })
      .where(eq(schema.mcqCache.id, entry.id))

    details.push({
      id: entry.id,
      old: entry.selectedOption,
      new: correctOption,
    })
    fixed++
  }

  return {
    success: true,
    total: entries.length,
    fixed,
    skipped,
    errors,
    details,
  }
})
