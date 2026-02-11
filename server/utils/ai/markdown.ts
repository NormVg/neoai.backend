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
 * Also sanitizes control characters that AI may output inside JSON strings.
 */
export function extractJSON(text: string): string {
  // Try to extract from code fence first (```json ... ``` or ``` ... ```)
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)```/)
  let raw: string
  if (fenceMatch) {
    raw = fenceMatch[1].trim()
  } else {
    // Otherwise strip fences and try to find raw JSON object
    raw = text
      .replace(/```(?:json|javascript|js|python|py|c|cpp|java)?\n?/gi, '')
      .replace(/```/g, '')
      .trim()
  }

  // Sanitize unescaped control characters inside JSON string values.
  // AI sometimes outputs literal tabs, carriage returns, etc.
  // which are invalid unescaped inside JSON strings.
  // We must NOT touch structural whitespace (newlines/tabs between keys),
  // so we walk the string tracking whether we're inside a quoted value.
  raw = sanitizeJSONControlChars(raw)

  return raw
}

/**
 * Walk a JSON string and escape control characters only inside quoted values.
 * Structural whitespace (newlines, tabs between keys) is left untouched.
 */
function sanitizeJSONControlChars(json: string): string {
  const out: string[] = []
  let inString = false
  for (let i = 0; i < json.length; i++) {
    const ch = json[i]

    if (inString) {
      if (ch === '\\') {
        // Already-escaped sequence — pass through as-is
        out.push(ch, json[i + 1] ?? '')
        i++
        continue
      }
      if (ch === '"') {
        inString = false
        out.push(ch)
        continue
      }
      // Inside a string value — escape control characters
      const code = ch.charCodeAt(0)
      if (code < 0x20) {
        switch (ch) {
          case '\n': out.push('\\n'); break
          case '\r': out.push('\\r'); break
          case '\t': out.push('\\t'); break
          default: break // strip other control chars
        }
        continue
      }
      out.push(ch)
    } else {
      // Outside a string — structural context
      if (ch === '"') {
        inString = true
      }
      out.push(ch)
    }
  }
  return out.join('')
}
