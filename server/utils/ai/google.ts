import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { eq } from 'drizzle-orm'

// Model configuration
export const MODEL = 'gemini-2.5-flash-lite'

// API Key rotation system
let currentKeyIndex = 0

// In-memory key cache with TTL — avoids hitting DB on every request
let cachedKeys: string[] = []
let cacheTimestamp = 0
const CACHE_TTL = 60_000 // 1 minute

/**
 * Invalidate the in-memory key cache.
 * Called from admin endpoints when keys are added/removed/toggled.
 */
export function invalidateKeyCache() {
  cachedKeys = []
  cacheTimestamp = 0
  console.log('[key-rotation] Key cache invalidated')
}

/**
 * Load active API keys from the database.
 * Uses an in-memory cache with 1-minute TTL to avoid excessive DB queries.
 * Falls back to env vars if no DB keys are found (backward compat).
 */
async function loadKeysFromDB(): Promise<string[]> {
  const now = Date.now()
  if (cachedKeys.length > 0 && now - cacheTimestamp < CACHE_TTL) {
    return cachedKeys
  }

  try {
    // Dynamic import to avoid circular dependency issues at startup
    const { getDatabase, schema } = await import('~~/server/utils/db')
    const db = getDatabase()

    const rows = await db
      .select({ key: schema.apiKeys.key })
      .from(schema.apiKeys)
      .where(eq(schema.apiKeys.active, true))

    if (rows.length > 0) {
      cachedKeys = rows.map((r) => r.key)
      cacheTimestamp = now
      console.log(`[key-rotation] Loaded ${cachedKeys.length} active key(s) from DB`)
      return cachedKeys
    }
  } catch (error) {
    console.error('[key-rotation] Failed to load keys from DB, falling back to env:', error)
  }

  // Fallback: read from env vars (backward compatibility)
  const config = useRuntimeConfig()
  const envKeys = [
    config.googleApiKey1,
    config.googleApiKey2,
    config.googleApiKey3,
    config.googleApiKey4,
    config.googleApiKey5,
  ].filter((key): key is string => !!key && key.length > 0)

  if (envKeys.length > 0) {
    cachedKeys = envKeys
    cacheTimestamp = now
    console.log(`[key-rotation] Using ${envKeys.length} key(s) from env vars (fallback)`)
  }

  return cachedKeys
}

function getNextApiKey(keys: string[]): string {
  currentKeyIndex = (currentKeyIndex + 1) % keys.length
  console.log(`[key-rotation] Switched to API key ${currentKeyIndex + 1}/${keys.length}`)
  return keys[currentKeyIndex]
}

function getCurrentGoogle(keys: string[]) {
  // Ensure index is within bounds after key list changes
  if (currentKeyIndex >= keys.length) {
    currentKeyIndex = 0
  }
  return createGoogleGenerativeAI({
    apiKey: keys[currentKeyIndex],
  })
}

/**
 * Call AI with automatic key rotation on quota error (429).
 * Tries each available key before giving up.
 * Keys are loaded from the database (with env var fallback).
 */
export async function callWithKeyRotation(
  generateFn: (google: ReturnType<typeof createGoogleGenerativeAI>) => Promise<any>,
  maxRetries?: number,
): Promise<any> {
  const keys = await loadKeysFromDB()

  if (keys.length === 0) {
    throw new Error('No API keys configured. Add keys in the admin panel or set GOOGLE_GENERATIVE_AI_API_KEY env vars.')
  }

  const retries = maxRetries ?? keys.length
  let lastError: any

  for (let i = 0; i < retries; i++) {
    try {
      return await generateFn(getCurrentGoogle(keys))
    } catch (error: any) {
      lastError = error

      // Check if quota exceeded (429 error)
      if (
        error.statusCode === 429
        || error.message?.includes('quota')
        || error.message?.includes('RESOURCE_EXHAUSTED')
      ) {
        console.log(`[key-rotation] API key ${currentKeyIndex + 1} quota exceeded, rotating...`)
        getNextApiKey(keys)
      } else {
        // For other errors, don't retry
        throw error
      }
    }
  }

  throw lastError
}
