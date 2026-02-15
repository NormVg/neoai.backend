/**
 * Dodo Payments – webhook (POST).
 * Verifies signature with webhookKey and routes to event handlers.
 * On payment_succeeded: updates user plan in DB using metadata.user_id and metadata.plan.
 */
import { eq } from 'drizzle-orm'
import { getDatabase, schema } from '~~/server/utils/db'

function getPlanExpiresAt(plan: string): Date | null {
  if (plan === 'lifetime') return null
  if (plan === '2weeks') {
    const d = new Date()
    d.setDate(d.getDate() + 14)
    return d
  }
  return null
}

export default defineEventHandler((event) => {
  const {
    private: { webhookKey },
  } = useRuntimeConfig()

  const handler = Webhooks({
    webhookKey,
    onPayload: async (payload: any) => {
      if (process.dev) {
        console.log('[dodo webhook]', payload?.type ?? 'payload', payload)
      }
    },
    onPaymentSucceeded: async (payload: any) => {
      console.log('[dodo webhook] onPaymentSucceeded payload:', JSON.stringify(payload, null, 2))
      const metadata = payload?.metadata ?? {}
      const userId = metadata.user_id ?? metadata.userId
      const plan = (metadata.plan as string) ?? '2weeks'

      if (!userId) {
        console.warn('[dodo webhook] payment_succeeded: no user_id in metadata', payload?.id)
        return
      }

      const planExpiresAt = getPlanExpiresAt(plan)
      const db = getDatabase()
      try {
        await db
          .update(schema.users)
          .set({
            plan: plan === 'lifetime' ? 'lifetime' : '2weeks',
            planExpiresAt: planExpiresAt ?? null,
          })
          .where(eq(schema.users.id, userId))
        console.log('[dodo webhook] payment_succeeded: updated user', userId, 'plan', plan)
      } catch (err) {
        console.error('[dodo webhook] payment_succeeded: failed to update user', userId, err)
      }
    },
    onSubscriptionActive: async (payload: any) => {
      const metadata = payload?.metadata ?? {}
      const userId = metadata.user_id ?? metadata.userId
      const plan = (metadata.plan as string) ?? '2weeks'
      if (!userId) return
      const planExpiresAt = getPlanExpiresAt(plan)
      const db = getDatabase()
      try {
        await db
          .update(schema.users)
          .set({
            plan: plan === 'lifetime' ? 'lifetime' : '2weeks',
            planExpiresAt: planExpiresAt ?? null,
          })
          .where(eq(schema.users.id, userId))
        console.log('[dodo webhook] subscription_active: updated user', userId, 'plan', plan)
      } catch (err) {
        console.error('[dodo webhook] subscription_active: failed to update user', userId, err)
      }
    },
  })

  return handler(event)
})
