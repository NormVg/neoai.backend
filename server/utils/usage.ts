import { eq, sql } from 'drizzle-orm'
import { getDatabase, schema } from '~~/server/utils/db'

/**
 * Validates if the user has an active plan (lifetime or valid 2weeks).
 * Throws 403 if invalid.
 */
export async function verifyPlanAccess(userId: string) {
  const db = getDatabase()
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1)

  if (!user) {
    throw createError({ statusCode: 401, message: 'User not found' })
  }

  const now = new Date()
  const isLifetime = user.plan === 'lifetime'
  const isActivePlan =
    user.plan === '2weeks' && user.planExpiresAt && new Date(user.planExpiresAt) > now

  if (!isLifetime && !isActivePlan) {
    throw createError({
      statusCode: 403,
      message: 'Active plan required. Please upgrade or renew your subscription.',
    })
  }

  return user
}

/**
 * Checks usage quota and increments request count.
 * Resets quota if 14 days have passed.
 * Throws 429 if quota exceeded.
 */
export async function checkAndIncrementUsage(userId: string) {
  const db = getDatabase()

  // We fetch user again here to ensure atomic updates with RETURNING if needed,
  // but for now we'll do a check-then-update pattern wrapped in transaction or just logic.
  // Actually, verifyPlanAccess already fetches user, so we could optimize, but let's keep it safe.

  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1)

  if (!user) return

  const now = new Date()
  let requestCount = user.requestCount
  let quotaResetAt = new Date(user.quotaResetAt)
  const quotaLimit = user.quotaLimit

  // 1. Check if quota needs reset
  if (now > quotaResetAt) {
    // Reset window: 14 days from now
    const newResetDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

    await db.update(schema.users)
      .set({
        requestCount: 1, // This request counts as the first one
        quotaResetAt: newResetDate
      })
      .where(eq(schema.users.id, userId))

    return // Success
  }

  // 2. Check if limit exceeded
  if (requestCount >= quotaLimit) {
    throw createError({
      statusCode: 429,
      message: `Usage quota exceeded (${quotaLimit} requests / 14 days). Resets on ${quotaResetAt.toLocaleDateString()}.`,
    })
  }

  // 3. Increment count
  await db.update(schema.users)
    .set({
      requestCount: requestCount + 1
    })
    .where(eq(schema.users.id, userId))
}
