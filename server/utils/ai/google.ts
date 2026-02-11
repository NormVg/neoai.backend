import { createGoogleGenerativeAI } from '@ai-sdk/google'

// Model configuration
export const MODEL = 'gemini-2.5-flash-lite'

// API Key rotation system
let currentKeyIndex = 0

export function getApiKeys(): string[] {
  const config = useRuntimeConfig()
  return [
    config.googleApiKey1,
    config.googleApiKey2,
    config.googleApiKey3,
    config.googleApiKey4,
    config.googleApiKey5,
  ].filter((key): key is string => !!key && key.length > 0)
}

function getNextApiKey(keys: string[]): string {
  currentKeyIndex = (currentKeyIndex + 1) % keys.length
  console.log(`[key-rotation] Switched to API key ${currentKeyIndex + 1}/${keys.length}`)
  return keys[currentKeyIndex]
}

function getCurrentGoogle(keys: string[]) {
  return createGoogleGenerativeAI({
    apiKey: keys[currentKeyIndex],
  })
}

/**
 * Call AI with automatic key rotation on quota error (429).
 * Tries each available key before giving up.
 */
export async function callWithKeyRotation(
  generateFn: (google: ReturnType<typeof createGoogleGenerativeAI>) => Promise<any>,
  maxRetries?: number,
): Promise<any> {
  const keys = getApiKeys()

  if (keys.length === 0) {
    throw new Error('No API keys configured')
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
