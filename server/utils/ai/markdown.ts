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
