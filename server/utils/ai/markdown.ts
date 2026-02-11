import removeMd from 'remove-markdown'

/**
 * Strip all markdown formatting from AI response to extract clean text.
 * Ported from server/src/routes/ai.js
 */
export function stripMarkdown(text: string): string {
  // First remove code block fences aggressively
  const preCleaned = text
    .replace(/```(?:json|javascript|js|python|py|c|cpp|java)?\n?/gi, '')
    .replace(/```/g, '')

  // Use remove-markdown for the rest (headers, bold, lists, etc.)
  return removeMd(preCleaned).trim()
}

/**
 * Extract JSON from AI response text.
 * Handles responses wrapped in markdown code fences (```json ... ```)
 * without running removeMd which can corrupt JSON content.
 */
export function extractJSON(text: string): string {
  // Try to extract from code fence first (```json ... ``` or ``` ... ```)
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)```/)
  if (fenceMatch) {
    return fenceMatch[1].trim()
  }

  // Otherwise strip fences and try to find raw JSON object
  const stripped = text
    .replace(/```(?:json|javascript|js|python|py|c|cpp|java)?\n?/gi, '')
    .replace(/```/g, '')
    .trim()

  return stripped
}
