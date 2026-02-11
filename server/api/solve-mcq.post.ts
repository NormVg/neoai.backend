import { generateText } from 'ai'
import { callWithKeyRotation, MODEL } from '~~/server/utils/ai/google'
import { stripMarkdown, extractJSON } from '~~/server/utils/ai/markdown'
import { generateMCQCacheKey, lookupMCQCache, saveMCQCache } from '~~/server/utils/ai/cache'
import { buildMCQPrompt, MCQ_SYSTEM_PROMPT } from '~~/server/utils/prompts/mcq'

/**
 * POST /api/solve-mcq
 *
 * Body: { question: string, options: string[], code?: string }
 * Response: { success: true, cached: boolean, answer: number, selectedOption: string, explanation: string, confidence: number }
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { question, options, code } = body

    // Validation
    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      throw createError({
        statusCode: 400,
        message: 'Invalid request. Required: question (string), options (array of 2+ strings)',
      })
    }

    // Generate cache key from normalized question + options
    const cacheKey = generateMCQCacheKey(question, options)

    // Check cache first
    const cached = await lookupMCQCache(cacheKey)
    if (cached) {
      return {
        success: true,
        cached: true,
        ...cached,
      }
    }

    // Cache miss - call AI
    console.log('[solve-mcq] Cache miss, calling AI...')

    const prompt = buildMCQPrompt(question, options, code)

    const { text } = await callWithKeyRotation((google) =>
      generateText({
        model: google(MODEL),
        system: MCQ_SYSTEM_PROMPT,
        prompt,
        temperature: 0.1,
        maxTokens: 1024,
      }),
    )

    // Parse AI response
    let result: { answer: number; selectedOption: string; explanation: string; confidence: number }
    try {
      const cleaned = extractJSON(text)
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }
      result = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error('[solve-mcq] Failed to parse AI response:', text)
      throw createError({
        statusCode: 500,
        message: 'Failed to parse AI response',
        data: { rawResponse: text },
      })
    }

    // Save to cache (fire and forget - don't block response)
    saveMCQCache({ question, options, code }, result, cacheKey)

    return {
      success: true,
      cached: false,
      ...result,
    }
  } catch (error: any) {
    // Re-throw if it's already a createError
    if (error.statusCode) throw error

    console.error('[solve-mcq] Error:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to solve MCQ',
    })
  }
})
