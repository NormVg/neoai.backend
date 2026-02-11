import { generateText } from 'ai'
import { callWithKeyRotation, MODEL } from '~~/server/utils/ai/google'
import { stripMarkdown, extractJSON } from '~~/server/utils/ai/markdown'
import { generateCodeCacheKey, lookupCodeCache, saveCodeCache } from '~~/server/utils/ai/cache'
import { buildCodePrompt, CODE_SYSTEM_PROMPT } from '~~/server/utils/prompts/code'

/**
 * POST /api/solve-code
 *
 * Body: { question: string, language: string, inputFormat?: string, outputFormat?: string, testCases?: string }
 * Response: { success: true, cached: boolean, code: string, explanation: string, timeComplexity: string, spaceComplexity: string }
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { question, language, inputFormat, outputFormat, testCases } = body

    // Validation
    if (!question || !language) {
      throw createError({
        statusCode: 400,
        message: 'Invalid request. Required: question (string), language (string)',
      })
    }

    // Generate cache key from normalized question + language
    const cacheKey = generateCodeCacheKey(question, language)

    // Check cache first
    const cached = await lookupCodeCache(cacheKey)
    if (cached) {
      return {
        success: true,
        cached: true,
        ...cached,
      }
    }

    // Cache miss - call AI
    console.log('[solve-code] Cache miss, calling AI...')

    const prompt = buildCodePrompt(question, language, inputFormat, outputFormat, testCases)

    const { text } = await callWithKeyRotation((google) =>
      generateText({
        model: google(MODEL),
        system: CODE_SYSTEM_PROMPT,
        prompt,
        temperature: 0.2,
        maxTokens: 4096,
      }),
    )

    // Parse AI response
    let result: { code: string; explanation: string; timeComplexity: string; spaceComplexity: string }
    try {
      const cleaned = extractJSON(text)
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }
      result = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error('[solve-code] Failed to parse AI response:', text)
      throw createError({
        statusCode: 500,
        message: 'Failed to parse AI response',
        data: { rawResponse: text },
      })
    }

    // Save to cache (fire and forget - don't block response)
    saveCodeCache({ question, language, inputFormat, outputFormat, testCases }, result, cacheKey)

    return {
      success: true,
      cached: false,
      ...result,
    }
  } catch (error: any) {
    // Re-throw if it's already a createError
    if (error.statusCode) throw error

    console.error('[solve-code] Error:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to solve code problem',
    })
  }
})
